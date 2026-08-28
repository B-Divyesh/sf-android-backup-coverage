export type FileRecord = {
  path: string;
  name: string;
  size: number;
  modified: number;
  type?: string;
};

export type FileStatus = 'verified' | 'waiting' | 'late' | 'changed';

export type ComparedFile = FileRecord & {
  status: FileStatus;
  destinationSize?: number;
};

export type Receipt = {
  id: string;
  createdAt: number;
  sourceLabel: string;
  destinationLabel: string;
  windowHours: number;
  files: ComparedFile[];
  counts: Record<FileStatus, number>;
  coverage: number;
};

export const normalizePath = (path: string) => path
  .replaceAll('\\', '/')
  .replace(/^\.\//, '')
  .replace(/^\/+|\/+$/g, '')
  .normalize('NFC')
  .toLocaleLowerCase();

const basename = (path: string) => normalizePath(path).split('/').at(-1) ?? '';

const findDestination = (source: FileRecord, destination: FileRecord[]) => {
  const sourcePath = normalizePath(source.path);
  const exact = destination.find((file) => normalizePath(file.path) === sourcePath);
  if (exact) return exact;

  const suffix = destination.filter((file) => {
    const candidate = normalizePath(file.path);
    return candidate.endsWith(`/${sourcePath}`) || sourcePath.endsWith(`/${candidate}`);
  });
  if (suffix.length === 1) return suffix[0];

  const uniqueNameAndSize = destination.filter((file) => basename(file.path) === basename(sourcePath) && file.size === source.size);
  return uniqueNameAndSize.length === 1 ? uniqueNameAndSize[0] : undefined;
};

export function compareFiles(
  source: FileRecord[],
  destination: FileRecord[],
  windowHours: number,
  now = Date.now(),
): ComparedFile[] {
  const windowMs = windowHours * 60 * 60 * 1000;
  return source.map((file) => {
    const match = findDestination(file, destination);
    if (match && match.size === file.size) return { ...file, status: 'verified', destinationSize: match.size };
    if (match) return { ...file, status: 'changed', destinationSize: match.size };
    const status: FileStatus = now - file.modified > windowMs ? 'late' : 'waiting';
    return { ...file, status };
  });
}

export function makeReceipt(
  source: FileRecord[],
  destination: FileRecord[],
  sourceLabel: string,
  destinationLabel: string,
  windowHours: number,
  now = Date.now(),
): Receipt {
  const files = compareFiles(source, destination, windowHours, now);
  const counts: Record<FileStatus, number> = { verified: 0, waiting: 0, late: 0, changed: 0 };
  files.forEach((file) => counts[file.status]++);
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    sourceLabel,
    destinationLabel,
    windowHours,
    files,
    counts,
    coverage: files.length ? Math.round((counts.verified / files.length) * 1000) / 10 : 100,
  };
}

export const humanSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};
