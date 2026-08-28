# Demo contract

- URL: <https://android-backup-coverage.sociobot.in/demo>
- Alternate entry: `/?demo=1`
- Sample: four Android camera or screenshot files compared with three backup-copy records.
- Result: two matches, one changed size, one missing file, and 50% coverage.
- Storage: IndexedDB database `demo:backup-coverage-local`, separate from `backup-coverage-local`.
- Reset: use **Reset demo** to restore the four seeded files and the 50% result.
- Exit: use **Start for real** to clear demo state and open the real checker.

The banner remains visible throughout demo mode. Demo actions never read or write the real database.
