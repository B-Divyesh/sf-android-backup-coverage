# Android Backup Coverage

Know every photo and video made it.

This local web app is for Android owners who copy photos and videos elsewhere. Compare a phone folder with a backup copy. See what matches, changed, or is missing.

Try the isolated sample at <https://android-backup-coverage.sociobot.in/demo>.

## Use the app

1. Choose a phone folder, such as DCIM or Pictures.
2. Choose a backup folder your browser can open, or import its JSON file list.
3. Choose how long a new file may take to arrive.
4. Compare both folders and review the backup check.
5. Export a backup check as JSON or CSV.

A match has the same relative path and file size. The app does not create a backup. Test a real restore before deleting files.

## Privacy, demo, and offline use

Runs entirely in your browser. Files stay on your device. The app uses no analytics, tracking, account, payment, or data API. Free. No account needed.

The sample demo does not read or change real saved checks. Demo data uses a separate IndexedDB database named `demo:backup-coverage-local`. Reset restores four sample files. Starting a real backup check clears the demo data.

Works offline after the first visit. Open `/demo` online once, then reload it without a connection.

## Develop and verify

Requires Node.js 22 or newer.

```sh
npm ci
npm test
npm run build
```

`npm test` builds the app and runs unit and browser checks. It covers desktop, 390 px mobile, accessibility, privacy, routing, and offline use.

Every public claim and its command are listed in `.factory/claims.json`. For example:

```sh
npm test -- --grep @claim:offline-reload
```

`npm run build` writes the static release to `dist/`. Preview it with:

```sh
npm run preview
```

## JSON file-list format

Import a list of files, or an object containing `files` or `source`. Each file needs a relative path and byte size. Name, modified time, and type are optional.

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

You can import a JSON backup check as the backup file list.

## Android wrapper

The Capacitor project uses application ID `in.sociobot.androidbackupcoverage`. Refresh it after web changes:

```sh
npm run build
npx cap sync android
```

This release is a static PWA. APK signing and publishing belong to a later Android work order. Never commit a keystore or secret.

## Deploy

Deploy `dist/` as a static site. `staticwebapp.config.json` defines `/demo`, the real 404 response, security headers, MIME types, and cache rules.

The factory deployment command is:

```sh
/opt/fleet/lib/deploy-static.sh android-backup-coverage dist
```

## License

[MIT](LICENSE) © 2026 Sociobot (Param Factory).
