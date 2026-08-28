# Android Backup Coverage

Android Backup Coverage is a local-first verifier for people who back up phone photos or other folders to a NAS, USB disk, cloud mount, or another tool. It compares a user-selected source with a user-selected destination (or portable JSON manifest) and produces a readable receipt of verified, waiting, late, and changed files.

It is intentionally not a backup service: it does not move files, connect to cloud accounts, read app-private storage, or promise recoverability. A verified item is a matching relative path and file size. Important data should still be restored periodically.

Live product: <https://android-backup-coverage.sociobot.in>

## Product behavior

- Select a browser-readable source folder such as `DCIM` or `Pictures`.
- Select a mounted destination folder, or import a JSON manifest from the destination.
- Choose an expected arrival window and visible reminder interval.
- Review and filter a local coverage receipt; export it as JSON or CSV.
- Keep the latest three receipts free. A $12 one-time Pro license keeps up to 100 local receipts.
- Continue using saved application code and local checks offline after the PWA has cached one full load.

All folder metadata and receipts are kept in IndexedDB on the device. No analytics or runtime CDN is used. License verification is the only product API request and happens only when a license is present.

## Develop and verify

Requires Node.js 22+.

```sh
npm install
npm run dev
npm test
npm run build
```

`npm test` runs Vitest comparison tests and builds the app before Playwright checks in desktop Chromium and a 390 px Android viewport, including axe accessibility and offline coverage. It therefore passes from a fresh checkout without a pre-existing `dist/`. `npm run build` is the deployment command and writes the static site to `dist/`, with `dist/index.html` at its root.

Preview the production output with:

```sh
npm run preview
```

## Manifest format

The importer accepts an array of file records, or an object containing `files` or `source`. Each item needs a relative `path` and byte `size`; `name`, `modified` (Unix milliseconds), and `type` are optional.

```json
{
  "files": [
    {
      "path": "DCIM/Camera/IMG_0001.jpg",
      "size": 3145728,
      "modified": 1787832000000
    }
  ]
}
```

JSON receipts exported by the app can also be imported as destination evidence.

## Android wrapper

The checked-in Capacitor project uses application ID `in.sociobot.androidbackupcoverage`. Refresh it after web changes with:

```sh
npm run build
npx cap sync android
```

The current work order is a static PWA deployment; signing and publishing an APK are intentionally left to the later Android artifact work order. No keystore or secret belongs in this repository.

## Deployment

Deploy the contents of `dist/` as a static site with the included `/privacy/`, `/terms/`, and `/offline.html` documents. `staticwebapp.config.json` is included in `dist/` and configures Azure Static Web Apps with long-lived immutable caching for fingerprinted `assets/`, short-lived HTML/service-worker responses, manifest MIME type, and response security policies. Do not override those cache rules at the edge.

## License

[MIT](LICENSE) © 2026 Sociobot (Param Factory).
