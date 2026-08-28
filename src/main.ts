import '@fontsource/atkinson-hyperlegible-next/latin-400.css';
import '@fontsource/atkinson-hyperlegible-next/latin-600.css';
import '@fontsource-variable/fraunces/wght.css';
import './styles.css';
import { humanSize, makeReceipt, type FileRecord, type Receipt } from './coverage';
import { clearState, loadState, saveState, type StoredState } from './storage';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

const emptyState = (): StoredState => ({
  source: [], destination: [], sourceLabel: '', destinationLabel: '', windowHours: 24, reminderDays: 1, history: [],
});

let state = emptyState();
let activeFilter = 'all';
let licenseValid = false;

const statusLabel = { verified: 'Verified', waiting: 'Waiting', late: 'Late', changed: 'Size changed' } as const;

function showError(message: string) {
  const banner = $('#error-banner');
  banner.textContent = message;
  banner.hidden = false;
  banner.focus();
}

function clearError() {
  $('#error-banner').hidden = true;
}

function announceSelection(kind: 'source' | 'destination') {
  const files = state[kind];
  const label = kind === 'source' ? state.sourceLabel : state.destinationLabel;
  $(`#${kind}-selection`).textContent = files.length
    ? `${label} · ${files.length.toLocaleString()} file${files.length === 1 ? '' : 's'} ready`
    : `No ${kind} selected`;
  $(`#${kind}-step`).classList.toggle('complete', files.length > 0);
  ($('#run-check') as HTMLButtonElement).disabled = !(state.source.length && state.destination.length);
}

const stripTopFolder = (path: string) => {
  const parts = path.replaceAll('\\', '/').split('/').filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join('/') : parts[0] ?? '';
};

function recordsFromFiles(files: FileList): FileRecord[] {
  return [...files]
    .filter((file) => file.size >= 0)
    .map((file) => ({
      path: file.webkitRelativePath ? stripTopFolder(file.webkitRelativePath) : file.name,
      name: file.name,
      size: file.size,
      modified: file.lastModified || Date.now(),
      type: file.type,
    }));
}

async function readDirectory(handle: FileSystemDirectoryHandle, prefix = ''): Promise<FileRecord[]> {
  const records: FileRecord[] = [];
  for await (const entry of handle.values()) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === 'directory') records.push(...await readDirectory(entry, path));
    else {
      const file = await entry.getFile();
      records.push({ path, name: file.name, size: file.size, modified: file.lastModified, type: file.type });
    }
  }
  return records;
}

async function chooseDirectory(kind: 'source' | 'destination') {
  clearError();
  if (!window.showDirectoryPicker) {
    $<HTMLInputElement>(`#${kind}-files`).click();
    return;
  }
  try {
    const handle = await window.showDirectoryPicker();
    const button = $<HTMLButtonElement>(`#${kind}-pick`);
    button.disabled = true;
    button.textContent = 'Scanning…';
    const records = await readDirectory(handle);
    state[kind] = records;
    if (kind === 'source') state.sourceLabel = handle.name;
    else state.destinationLabel = handle.name;
    announceSelection(kind);
    await saveState(state);
    button.textContent = kind === 'source' ? 'Change source folder' : 'Change destination folder';
    button.disabled = false;
  } catch (error) {
    const named = error as DOMException;
    if (named.name !== 'AbortError') showError('That folder could not be read. Check the browser permission, then choose it again.');
  }
}

async function acceptFileSelection(kind: 'source' | 'destination', input: HTMLInputElement) {
  if (!input.files?.length) return;
  const records = recordsFromFiles(input.files);
  state[kind] = records;
  const relative = input.files[0].webkitRelativePath;
  const label = relative?.split('/')[0] || `${records.length} selected files`;
  if (kind === 'source') state.sourceLabel = label;
  else state.destinationLabel = label;
  announceSelection(kind);
  await saveState(state);
}

function parseManifest(value: unknown): FileRecord[] {
  const candidate = value as { files?: unknown[]; source?: unknown[] } | unknown[];
  const list = Array.isArray(candidate) ? candidate : candidate.files ?? candidate.source;
  if (!Array.isArray(list)) throw new Error('Manifest does not contain a files list');
  const records = list.map((item) => {
    const file = item as Partial<FileRecord>;
    if (!file.path || typeof file.size !== 'number') throw new Error('A manifest file entry is missing its path or size');
    return { path: file.path, name: file.name ?? file.path.split('/').at(-1) ?? file.path, size: file.size, modified: file.modified ?? 0, type: file.type };
  });
  return records;
}

async function importManifest(input: HTMLInputElement) {
  if (!input.files?.[0]) return;
  try {
    const value = JSON.parse(await input.files[0].text()) as unknown;
    state.destination = parseManifest(value);
    state.destinationLabel = input.files[0].name;
    announceSelection('destination');
    await saveState(state);
    clearError();
  } catch {
    showError('That manifest is not valid. Import a Backup Coverage JSON file with path and size for each file.');
  }
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
}

function renderReminder() {
  const status = $('#reminder-status');
  if (!state.reminderDays) {
    status.textContent = 'Visible reminders are off.';
    status.classList.remove('due');
    return;
  }
  if (!state.nextCheckAt) {
    status.textContent = 'Your next check is scheduled after the first receipt.';
    status.classList.remove('due');
    return;
  }
  const due = Date.now() >= state.nextCheckAt;
  status.textContent = due ? 'A fresh verification is due now.' : `Next check: ${formatDate(state.nextCheckAt)}.`;
  status.classList.toggle('due', due);
}

function renderReceipt(receipt: Receipt, scroll = false) {
  state.latest = receipt;
  $('#receipt').hidden = false;
  $('#coverage-percent').textContent = `${receipt.coverage}%`;
  $('#coverage-fill').style.width = `${receipt.coverage}%`;
  $('#receipt-stamp').textContent = `${receipt.sourceLabel} → ${receipt.destinationLabel} · ${formatDate(receipt.createdAt)}`;
  $('#metric-verified').textContent = String(receipt.counts.verified);
  $('#metric-waiting').textContent = String(receipt.counts.waiting);
  $('#metric-late').textContent = String(receipt.counts.late);
  $('#metric-changed').textContent = String(receipt.counts.changed);
  const attention = receipt.counts.late + receipt.counts.changed;
  $('#receipt-summary').textContent = attention
    ? `${attention} file${attention === 1 ? '' : 's'} need attention. ${receipt.counts.waiting ? `${receipt.counts.waiting} more are still inside the expected window.` : 'Everything else has a matching second copy.'}`
    : receipt.counts.waiting
      ? `No late gaps. ${receipt.counts.waiting} file${receipt.counts.waiting === 1 ? ' is' : 's are'} still inside the expected arrival window.`
      : 'Every source file has a matching path and size in the second copy.';
  renderRows();
  if (scroll) $('#receipt').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRows() {
  if (!state.latest) return;
  const rows = state.latest.files.filter((file) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'attention') return file.status === 'late' || file.status === 'changed';
    return file.status === 'verified';
  });
  const body = $('#result-rows');
  body.replaceChildren();
  if (!rows.length) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="empty-row">No files match this filter.</td>';
    body.append(row);
    return;
  }
  rows.slice(0, 500).forEach((file) => {
    const row = document.createElement('tr');
    const path = document.createElement('td');
    path.dataset.label = 'File';
    const strong = document.createElement('strong');
    strong.textContent = file.name;
    const small = document.createElement('small');
    small.textContent = file.path;
    path.append(strong, small);
    const size = document.createElement('td');
    size.dataset.label = 'Size';
    size.textContent = humanSize(file.size);
    const modified = document.createElement('td');
    modified.dataset.label = 'Captured';
    modified.textContent = file.modified ? formatDate(file.modified) : 'Unknown';
    const status = document.createElement('td');
    status.dataset.label = 'Status';
    const badge = document.createElement('span');
    badge.className = `status ${file.status}`;
    badge.textContent = `${file.status === 'verified' ? '✓' : file.status === 'waiting' ? '◷' : '!'} ${statusLabel[file.status]}`;
    status.append(badge);
    row.append(path, size, modified, status);
    body.append(row);
  });
}

async function runCheck() {
  clearError();
  const button = $<HTMLButtonElement>('#run-check');
  button.disabled = true;
  button.textContent = 'Comparing…';
  await new Promise((resolve) => setTimeout(resolve, 120));
  const receipt = makeReceipt(state.source, state.destination, state.sourceLabel, state.destinationLabel, state.windowHours);
  state.latest = receipt;
  state.history = [receipt, ...state.history.filter((item) => item.id !== receipt.id)].slice(0, licenseValid ? 100 : 3);
  state.nextCheckAt = state.reminderDays ? receipt.createdAt + state.reminderDays * 86_400_000 : undefined;
  await saveState(state);
  renderReceipt(receipt, true);
  renderReminder();
  button.disabled = false;
  button.textContent = 'Compare both copies';
}

function download(name: string, body: string, type: string) {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([body], { type }));
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function exportJson() {
  if (!state.latest) return;
  download(`backup-coverage-${new Date(state.latest.createdAt).toISOString().slice(0, 10)}.json`, JSON.stringify({ schema: 1, exportedAt: Date.now(), ...state.latest }, null, 2), 'application/json');
}

function exportCsv() {
  if (!state.latest) return;
  const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const lines = ['path,size,modified,status', ...state.latest.files.map((file) => [file.path, file.size, new Date(file.modified).toISOString(), file.status].map(quote).join(','))];
  download(`backup-coverage-${new Date(state.latest.createdAt).toISOString().slice(0, 10)}.csv`, lines.join('\n'), 'text/csv');
}

function renderHistory() {
  const list = $('#history-list');
  list.replaceChildren();
  if (!state.history.length) {
    const empty = document.createElement('div');
    empty.className = 'dialog-empty';
    empty.innerHTML = '<p>No receipts yet.</p><p>Choose both folders and run your first comparison.</p>';
    list.append(empty);
    return;
  }
  state.history.forEach((receipt) => {
    const button = document.createElement('button');
    button.className = 'history-item';
    button.type = 'button';
    const details = document.createElement('span');
    const score = document.createElement('strong');
    score.textContent = `${receipt.coverage}% covered`;
    const route = document.createElement('small');
    route.textContent = `${receipt.sourceLabel} → ${receipt.destinationLabel}`;
    const time = document.createElement('time');
    time.textContent = formatDate(receipt.createdAt);
    details.append(score, route);
    button.append(details, time);
    button.addEventListener('click', () => {
      renderReceipt(receipt, true);
      $<HTMLDialogElement>('#history-dialog').close();
    });
    list.append(button);
  });
  if (!licenseValid && state.history.length >= 3) {
    const note = document.createElement('p');
    note.className = 'history-limit';
    note.textContent = 'Free keeps the latest 3 receipts. Pro keeps up to 100 on this device.';
    list.append(note);
  }
}

const LICENSE_KEY = 'sb_license:android-backup-coverage';
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const VERIFY_URL = 'https://api.sociobot.in/api/v1/products/android-backup-coverage/verify';

function setLicenseState(valid: boolean, message = '') {
  licenseValid = valid;
  $('#pro-open').textContent = valid ? 'Pro active' : 'Pro';
  $('#license-status').textContent = message || (valid ? 'Pro is active on this device.' : '');
}

async function verifyLicense(token: string, force = false) {
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { valid: boolean; checkedAt: number } | null;
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) {
    setLicenseState(cached.valid);
    return;
  }
  if (!navigator.onLine) {
    if (cached) setLicenseState(cached.valid, 'Offline. Using the last license check.');
    return;
  }
  try {
    const response = await fetch(`${VERIFY_URL}?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verification unavailable');
    const verdict = await response.json() as { valid: boolean; reason: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
    setLicenseState(verdict.valid, verdict.valid ? 'Purchase restored. Pro is active.' : 'This license is no longer active. Check the token or buy a new license.');
  } catch {
    if (cached) setLicenseState(cached.valid, 'Could not refresh the license. Using the last verified result.');
    else setLicenseState(false, 'Could not verify that license. Check your connection and try again.');
  }
}

async function initializeLicense() {
  const url = new URL(location.href);
  const incoming = url.searchParams.get('license');
  if (incoming) {
    localStorage.setItem(LICENSE_KEY, incoming);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  const token = incoming || localStorage.getItem(LICENSE_KEY);
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { valid: boolean } | null;
  if (cached?.valid) setLicenseState(true);
  if (token) await verifyLicense(token, Boolean(incoming));
}

function loadExample() {
  const now = Date.now();
  const source = [
    { path: 'DCIM/Camera/IMG_4821.jpg', name: 'IMG_4821.jpg', size: 3_820_000, modified: now - 3_600_000 },
    { path: 'DCIM/Camera/IMG_4820.jpg', name: 'IMG_4820.jpg', size: 4_220_000, modified: now - 7_200_000 },
    { path: 'Pictures/Screenshots/Screenshot_104.png', name: 'Screenshot_104.png', size: 852_000, modified: now - 100_000_000 },
    { path: 'DCIM/Camera/VID_1832.mp4', name: 'VID_1832.mp4', size: 28_200_000, modified: now - 180_000_000 },
  ];
  const destination = [source[0], source[1], { ...source[2], size: 620_000 }];
  renderReceipt(makeReceipt(source, destination, 'Phone photos', 'Home NAS', 24, now), true);
}

function bindEvents() {
  $('#source-pick').addEventListener('click', () => chooseDirectory('source'));
  $('#destination-pick').addEventListener('click', () => chooseDirectory('destination'));
  $<HTMLInputElement>('#source-files').addEventListener('change', (event) => acceptFileSelection('source', event.currentTarget as HTMLInputElement));
  $<HTMLInputElement>('#destination-files').addEventListener('change', (event) => acceptFileSelection('destination', event.currentTarget as HTMLInputElement));
  $<HTMLInputElement>('#manifest-file').addEventListener('change', (event) => importManifest(event.currentTarget as HTMLInputElement));
  $<HTMLSelectElement>('#arrival-window').addEventListener('change', async (event) => {
    state.windowHours = Number((event.currentTarget as HTMLSelectElement).value);
    await saveState(state);
  });
  $<HTMLSelectElement>('#reminder-interval').addEventListener('change', async (event) => {
    state.reminderDays = Number((event.currentTarget as HTMLSelectElement).value);
    state.nextCheckAt = state.reminderDays && state.latest ? state.latest.createdAt + state.reminderDays * 86_400_000 : undefined;
    renderReminder();
    await saveState(state);
  });
  $('#run-check').addEventListener('click', runCheck);
  $('#load-example').addEventListener('click', loadExample);
  $('#export-json').addEventListener('click', exportJson);
  $('#export-csv').addEventListener('click', exportCsv);
  $$('.filter').forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter ?? 'all';
    $$('.filter').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderRows();
  }));
  $('#history-open').addEventListener('click', () => { renderHistory(); $<HTMLDialogElement>('#history-dialog').showModal(); });
  $('#pro-open').addEventListener('click', () => $<HTMLDialogElement>('#pro-dialog').showModal());
  $$('.dialog-close').forEach((button) => button.addEventListener('click', () => button.closest('dialog')?.close()));
  $$<HTMLDialogElement>('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
  $<HTMLFormElement>('#license-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = $<HTMLInputElement>('#license-input').value.trim();
    if (!token) return;
    localStorage.setItem(LICENSE_KEY, token);
    $('#license-status').textContent = 'Verifying…';
    await verifyLicense(token, true);
  });
  $('#reset-data').addEventListener('click', async () => {
    if (!confirm('Erase every saved folder manifest and verification receipt from this device? Your license will be kept.')) return;
    await clearState();
    state = emptyState();
    $('#receipt').hidden = true;
    announceSelection('source');
    announceSelection('destination');
  });
  const updateOnlineState = () => { $('#offline-banner').hidden = navigator.onLine; };
  addEventListener('online', updateOnlineState);
  addEventListener('offline', updateOnlineState);
  updateOnlineState();
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  let applyingUpdate = false;
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) $('#update-toast').hidden = false;
    });
  });
  $('#apply-update').addEventListener('click', () => {
    applyingUpdate = true;
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (applyingUpdate) location.reload();
  });
}

async function init() {
  bindEvents();
  document.body.dataset.ready = 'true';
  try { state = await loadState() ?? emptyState(); }
  catch { showError('Saved receipts could not be opened. You can still make a new check in this tab.'); }
  state.reminderDays ??= 1;
  announceSelection('source');
  announceSelection('destination');
  $<HTMLSelectElement>('#arrival-window').value = String(state.windowHours);
  $<HTMLSelectElement>('#reminder-interval').value = String(state.reminderDays);
  renderReminder();
  if (state.latest) renderReceipt(state.latest);
  await initializeLicense();
  await registerServiceWorker();
}

void init();
