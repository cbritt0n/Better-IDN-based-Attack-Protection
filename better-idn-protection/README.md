# Better IDN-based Attack Protection

Lightweight Chrome extension to detect mixed-script IDN domains that may be used for homograph/phishing attacks.

Features
- Detects mixed Unicode script usage in visited hostnames.
- Converts punycode domains to Unicode before analysis.
- User-managed whitelist via popup (stored in chrome.storage.sync).

Development

1. Run unit-like tests (Node):

```bash
npm test
```

2. Load unpacked extension in Chrome/Edge: open chrome://extensions, enable Developer mode, "Load unpacked" and point to this folder.

Packaging for release
- Locally: run `npm run pack` to create `extension.zip`.
- On GitHub: create a tag like `v1.0.0` and push; the release workflow will zip the repo and attach it as an artifact.

Contributing
- See `CONTRIBUTING.md` for contribution guidelines and PR process.

Security notes
- Popup output is sanitized and uses textContent to avoid DOM injection.
- Whitelist is stored using Chrome's `storage.sync`.

Contributing
- Open issues or PRs. Keep changes small and add tests.

License: MIT
