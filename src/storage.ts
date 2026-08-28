import type { FileRecord, Receipt } from './coverage';

export type StoredState = {
  source: FileRecord[];
  destination: FileRecord[];
  sourceLabel: string;
  destinationLabel: string;
  windowHours: number;
  reminderDays: number;
  nextCheckAt?: number;
  latest?: Receipt;
  history: Receipt[];
};

const DB_NAME = 'backup-coverage-local';
const STORE = 'state';

const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function loadState(): Promise<StoredState | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get('app');
    request.onsuccess = () => resolve(request.result as StoredState | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function saveState(state: StoredState) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(state, 'app');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearState() {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
