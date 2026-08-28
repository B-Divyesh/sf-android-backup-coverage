import { describe, expect, it, vi } from 'vitest';
import { compareFiles, humanSize, makeReceipt, normalizePath, type FileRecord } from '../src/coverage';

const now = Date.UTC(2026, 7, 27, 12);
const file = (path: string, size: number, ageHours = 1): FileRecord => ({
  path,
  name: path.split('/').at(-1)!,
  size,
  modified: now - ageHours * 60 * 60 * 1000,
});

describe('coverage comparison', () => {
  it('normalizes separators, case, and dot prefixes', () => {
    expect(normalizePath('./DCIM\\Camera/Photo.JPG')).toBe('dcim/camera/photo.jpg');
  });

  it('marks exact and nested destination copies as verified', () => {
    const source = [file('DCIM/Camera/a.jpg', 100), file('Pictures/b.png', 200)];
    const destination = [file('DCIM/Camera/a.jpg', 100), file('phone-backup/Pictures/b.png', 200)];
    expect(compareFiles(source, destination, 24, now).map((item) => item.status)).toEqual(['verified', 'verified']);
  });

  it('distinguishes waiting, late, and changed files', () => {
    const source = [file('new.jpg', 100, 2), file('late.jpg', 200, 30), file('changed.jpg', 300, 3)];
    const destination = [file('changed.jpg', 299)];
    expect(compareFiles(source, destination, 24, now).map((item) => item.status)).toEqual(['waiting', 'late', 'changed']);
  });

  it('does not accept ambiguous same-name matches', () => {
    const source = [file('DCIM/a.jpg', 100, 30)];
    const destination = [file('one/a.jpg', 100), file('two/a.jpg', 100)];
    expect(compareFiles(source, destination, 24, now)[0].status).toBe('late');
  });

  it('creates a deterministic coverage summary at a supplied time', () => {
    vi.spyOn(Math, 'random').mockReturnValue(.5);
    const receipt = makeReceipt([file('a.jpg', 100), file('b.jpg', 200, 30)], [file('a.jpg', 100)], 'DCIM', 'NAS', 24, now);
    expect(receipt.coverage).toBe(50);
    expect(receipt.counts).toEqual({ verified: 1, waiting: 0, late: 1, changed: 0 });
  });

  it('formats file sizes for readable receipts', () => {
    expect(humanSize(0)).toBe('0 B');
    expect(humanSize(1536)).toBe('1.5 KB');
    expect(humanSize(5 * 1024 ** 2)).toBe('5.0 MB');
  });
});
