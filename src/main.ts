import '@fontsource/atkinson-hyperlegible-next/latin-400.css';
import '@fontsource/atkinson-hyperlegible-next/latin-600.css';
import '@fontsource-variable/fraunces/wght.css';
import { ArrowRight, FolderOpen, ReceiptText, ScanSearch, createIcons } from 'lucide';
import './styles.css';
import { humanSize, makeReceipt, type FileRecord, type Receipt } from './coverage';
import { clearState, loadState, saveState, type StoredState } from './storage';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];
const currentUrl = new URL(location.href);
const demoMode = currentUrl.pathname.replace(/\/$/, '') === '/demo' || currentUrl.searchParams.get('demo') === '1';

const emptyState = (): StoredState => ({
  source: [], destination: [], sourceLabel: '', destinationLabel: '', windowHours: 24, reminderDays: 1, history: [],
});

const sampleState = (): StoredState => {
  const now = Date.now();
  const source: FileRecord[] = [
    { path: 'DCIM/Camera/IMG_4821.jpg', name: 'IMG_4821.jpg', size: 3_820_000, modified: now - 3_600_000, type: 'image/jpeg' },
    { path: 'DCIM/Camera/IMG_4820.jpg', name: 'IMG_4820.jpg', size: 4_220_000, modified: now - 7_200_000, type: 'image/jpeg' },
    { path: 'Pictures/Screenshots/Screenshot_104.png', name: 'Screenshot_104.png', size: 852_000, modified: now - 100_000_000, type: 'image/png' },
    { path: 'DCIM/Camera/IMG_4819.jpg', name: 'IMG_4819.jpg', size: 2_980_000, modified: now - 180_000_000, type: 'image/jpeg' },
  ];
  const destination = [source[0], source[1], { ...source[2], size: 620_000 }];
  const latest = makeReceipt(source, destination, 'Phone photos', 'Backup copy', 24, now);
  return {
    source, destination, sourceLabel: 'Phone photos', destinationLabel: 'Backup copy',
    windowHours: 24, reminderDays: 1, nextCheckAt: now + 86_400_000, latest, history: [latest],
  };
};

let state = emptyState();
let activeFilter = 'all';

const statusLabel = { verified: 'Verified', waiting: 'Waiting', late: 'Missing', changed: 'Size changed' } as const;

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
  const emptyLabel = kind === 'source' ? 'No phone folder selected' : 'No backup copy selected';
  $(`#${kind}-selection`).textContent = files.length
    ? `${label} · ${files.length.toLocaleString()} file${files.length === 1 ? '' : 's'} ready`
    : emptyLabel;
  $(`#${kind}-step`).classList.toggle('complete', files.length > 0);
  $<HTMLButtonElement>('#run-check').disabled = !(state.source.length && state.destination.length);
}

const persist = () => saveState(state, demoMode);

const stripTopFolder = (path: string) => {
  const parts = path.replaceAll('\\', '/').split('/').filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join('/') : parts[0] ?? '';
};

function recordsFromFiles(files: FileList): FileRecord[] {
  return [...files].map((file) => ({
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
    button.textContent = 'Reading folder…';
    state[kind] = await readDirectory(handle);
    if (kind === 'source') state.sourceLabel = handle.name;
    else state.destinationLabel = handle.name;
    announceSelection(kind);
    await persist();
    button.textContent = kind === 'source' ? 'Change phone folder' : 'Change backup folder';
    button.disabled = false;
  } catch (error) {
    const named = error as DOMException;
    if (named.name !== 'AbortError') showError('That folder could not be read. Check its browser permission, then choose it again.');
  }
}

async function acceptFileSelection(kind: 'source' | 'destination', input: HTMLInputElement) {
  if (!input.files?.length) return;
  state[kind] = recordsFromFiles(input.files);
  const relative = input.files[0].webkitRelativePath;
  const label = relative?.split('/')[0] || `${state[kind].length} selected files`;
  if (kind === 'source') state.sourceLabel = label;
  else state.destinationLabel = label;
  announceSelection(kind);
  await persist();
}

export function parseManifest(value: unknown): FileRecord[] {
  const candidate = value as { files?: unknown[]; source?: unknown[] } | unknown[];
  const list = Array.isArray(candidate) ? candidate : candidate.files ?? candidate.source;
  if (!Array.isArray(list)) throw new Error('File list missing');
  return list.map((item) => {
    const file = item as Partial<FileRecord>;
    if (!file.path || typeof file.size !== 'number') throw new Error('Path or size missing');
    return { path: file.path, name: file.name ?? file.path.split('/').at(-1) ?? file.path, size: file.size, modified: file.modified ?? 0, type: file.type };
  });
}

async function importManifest(input: HTMLInputElement) {
  if (!input.files?.[0]) return;
  try {
    state.destination = parseManifest(JSON.parse(await input.files[0].text()) as unknown);
    state.destinationLabel = input.files[0].name;
    announceSelection('destination');
    await persist();
    clearError();
  } catch {
    showError('That file list is not valid. Import JSON containing a path and size for each file.');
  }
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
}

function renderReminder() {
  const status = $('#reminder-status');
  if (!state.reminderDays) {
    status.textContent = 'Check reminders are off.';
    status.classList.remove('due');
    return;
  }
  if (!state.nextCheckAt) {
    status.textContent = 'Your next check is scheduled after the first result.';
    status.classList.remove('due');
    return;
  }
  const due = Date.now() >= state.nextCheckAt;
  status.textContent = due ? 'Run a fresh backup check now.' : `Next check: ${formatDate(state.nextCheckAt)}.`;
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
    ? `${attention} file${attention === 1 ? '' : 's'} need attention. ${receipt.counts.waiting ? `${receipt.counts.waiting} more are still within the arrival window.` : 'Every other file has a matching backup copy.'}`
    : receipt.counts.waiting
      ? `No missing files. ${receipt.counts.waiting} file${receipt.counts.waiting === 1 ? ' is' : 's are'} still within the arrival window.`
      : 'Every phone file has a matching path and size in the backup copy.';
  renderRows();
  if (scroll) $('#receipt').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRows() {
  if (!state.latest) return;
  const files = state.latest.files.filter((file) => activeFilter === 'all'
    || (activeFilter === 'attention' && (file.status === 'late' || file.status === 'changed'))
    || (activeFilter === 'verified' && file.status === 'verified'));
  const body = $('#result-rows');
  body.replaceChildren();
  if (!files.length) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="empty-row">No files match this filter.</td>';
    body.append(row);
    return;
  }
  files.slice(0, 500).forEach((file) => {
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
  state.history = [receipt, ...state.history.filter((item) => item.id !== receipt.id)];
  state.nextCheckAt = state.reminderDays ? receipt.createdAt + state.reminderDays * 86_400_000 : undefined;
  await persist();
  renderReceipt(receipt, true);
  renderReminder();
  button.disabled = false;
  button.textContent = 'Compare both folders';
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
  download(`backup-check-${new Date(state.latest.createdAt).toISOString().slice(0, 10)}.json`, JSON.stringify({ schema: 1, exportedAt: Date.now(), ...state.latest }, null, 2), 'application/json');
}

function exportCsv() {
  if (!state.latest) return;
  const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const lines = ['path,size,modified,status', ...state.latest.files.map((file) => [file.path, file.size, new Date(file.modified).toISOString(), file.status].map(quote).join(','))];
  download(`backup-check-${new Date(state.latest.createdAt).toISOString().slice(0, 10)}.csv`, lines.join('\n'), 'text/csv');
}

function renderHistory() {
  const list = $('#history-list');
  list.replaceChildren();
  if (!state.history.length) {
    const empty = document.createElement('div');
    empty.className = 'dialog-empty';
    empty.innerHTML = '<p>No saved checks yet.</p><p>Choose both folders and compare them.</p>';
    list.append(empty);
    return;
  }
  state.history.forEach((receipt) => {
    const button = document.createElement('button');
    button.className = 'history-item';
    button.type = 'button';
    const details = document.createElement('span');
    const score = document.createElement('strong');
    score.textContent = `${receipt.coverage}% verified`;
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
}

async function resetDemo() {
  await clearState(true);
  state = sampleState();
  activeFilter = 'all';
  $$('.filter').forEach((button) => {
    const active = button.dataset.filter === 'all';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  await saveState(state, true);
  announceSelection('source');
  announceSelection('destination');
  $<HTMLSelectElement>('#arrival-window').value = String(state.windowHours);
  $<HTMLSelectElement>('#reminder-interval').value = String(state.reminderDays);
  renderReminder();
  renderReceipt(state.latest!);
  $('#route-announcer').textContent = 'Demo reset to four sample photos.';
  $('#receipt-title').focus();
}

function bindEvents() {
  $('#source-pick').addEventListener('click', () => chooseDirectory('source'));
  $('#destination-pick').addEventListener('click', () => chooseDirectory('destination'));
  $<HTMLInputElement>('#source-files').addEventListener('change', (event) => acceptFileSelection('source', event.currentTarget as HTMLInputElement));
  $<HTMLInputElement>('#destination-files').addEventListener('change', (event) => acceptFileSelection('destination', event.currentTarget as HTMLInputElement));
  $<HTMLInputElement>('#manifest-file').addEventListener('change', (event) => importManifest(event.currentTarget as HTMLInputElement));
  $<HTMLSelectElement>('#arrival-window').addEventListener('change', async (event) => {
    state.windowHours = Number((event.currentTarget as HTMLSelectElement).value);
    await persist();
  });
  $<HTMLSelectElement>('#reminder-interval').addEventListener('change', async (event) => {
    state.reminderDays = Number((event.currentTarget as HTMLSelectElement).value);
    state.nextCheckAt = state.reminderDays && state.latest ? state.latest.createdAt + state.reminderDays * 86_400_000 : undefined;
    renderReminder();
    await persist();
  });
  $('#run-check').addEventListener('click', runCheck);
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
  $('#history-open').addEventListener('click', () => {
    renderHistory();
    $<HTMLDialogElement>('#history-dialog').showModal();
  });
  $$('.dialog-close').forEach((button) => button.addEventListener('click', () => button.closest('dialog')?.close()));
  $$<HTMLDialogElement>('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  }));
  $('#reset-data').addEventListener('click', async () => {
    const label = demoMode ? 'sample data' : 'saved file lists and backup checks';
    if (!confirm(`Erase all ${label} from this browser?`)) return;
    if (demoMode) await resetDemo();
    else {
      await clearState(false);
      state = emptyState();
      $('#receipt').hidden = true;
      announceSelection('source');
      announceSelection('destination');
      renderReminder();
    }
  });
  $('#reset-demo').addEventListener('click', resetDemo);
  $('#start-real').addEventListener('click', async (event) => {
    event.preventDefault();
    await clearState(true);
    location.assign('/#verify');
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

function setDemoMetadata() {
  if (!demoMode) return;
  document.title = 'Demo — Android Backup Coverage';
  $<HTMLLinkElement>('link[rel="canonical"]').href = 'https://android-backup-coverage.sociobot.in/demo';
  $<HTMLMetaElement>('meta[property="og:title"]').content = document.title;
  $<HTMLMetaElement>('meta[property="og:url"]').content = 'https://android-backup-coverage.sociobot.in/demo';
  $('#demo-banner').hidden = false;
  document.body.classList.add('is-demo');
  document.body.dataset.storageNamespace = 'demo:backup-coverage-local';
  const heroTitle = $('#hero-title');
  const heroHeading = document.createElement('h2');
  heroHeading.id = heroTitle.id;
  heroHeading.textContent = heroTitle.textContent;
  heroTitle.replaceWith(heroHeading);
  const receiptTitle = $('#receipt-title');
  const receiptHeading = document.createElement('h1');
  receiptHeading.id = receiptTitle.id;
  receiptHeading.tabIndex = -1;
  receiptHeading.textContent = receiptTitle.textContent;
  receiptTitle.replaceWith(receiptHeading);
  const receipt = $('#receipt');
  receipt.parentElement!.insertBefore(receipt, $('.hero'));
  $('#route-announcer').textContent = 'Demo loaded with four sample photos.';
}

async function init() {
  setDemoMetadata();
  createIcons({ icons: { ArrowRight, FolderOpen, ReceiptText, ScanSearch } });
  bindEvents();
  try {
    const stored = await loadState(demoMode);
    state = stored ?? (demoMode ? sampleState() : emptyState());
    if (demoMode && !stored) await saveState(state, true);
  } catch {
    state = demoMode ? sampleState() : emptyState();
    showError('Saved checks could not be opened. You can still make a new check in this tab.');
  }
  state.reminderDays ??= 1;
  announceSelection('source');
  announceSelection('destination');
  $<HTMLSelectElement>('#arrival-window').value = String(state.windowHours);
  $<HTMLSelectElement>('#reminder-interval').value = String(state.reminderDays);
  renderReminder();
  if (state.latest) renderReceipt(state.latest);
  document.body.dataset.ready = 'true';
  if (demoMode) $('#receipt-title').focus();
  await registerServiceWorker();
}

void init();
