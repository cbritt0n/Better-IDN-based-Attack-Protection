# Better IDN-based Attack Protection

Lightweight Chrome extension to detect mixed-script IDN domains that may be used for homograph/phishing attacks.

Features
- Detects mixed Unicode script usage in visited hostnames.
- Converts punycode domains to Unicode before analysis.
- User-managed whitelist via popup (stored in `chrome.storage.sync`).

Quick start (development)

1. Install dev dependencies (creates package-lock.json):

```bash
npm install
```

2. Run unit-like tests (Node):

```bash
npm test
```

3. Lint the project (ESLint):

```bash
npm run lint
```

4. Load unpacked extension into Chrome/Edge:

- Open `chrome://extensions`
- Enable Developer mode
- Click "Load unpacked" and select this folder (`better-idn-protection`).

Testing (your test site)

I have a registered test site you can use to validate behavior. With the extension enabled and Chrome open, navigate to:

```
https://xn--christinbritton-nlb.weebly.com/
```

You should see a popup and notification warning about the site's potential IDN-based homograph intent (unless you have whitelisted the domain).

Packaging for release

- Locally: create a packaged zip suitable for upload or release:

```bash
npm run pack
```

- GitHub: create a tag like `v1.0.0` and push; the provided release workflow will create a zip artifact for that tag.

CI & dependency updates

- Continuous Integration runs lint then tests via GitHub Actions (`.github/workflows/ci.yml`).
- Dependabot is configured to open PRs for npm and GitHub Actions updates (`.github/dependabot.yml`).

Contributing

- See `CONTRIBUTING.md` for contribution guidelines and PR process.
- Use the provided issue and PR templates.

Security notes

- Popup output is sanitized and uses `textContent` to avoid DOM injection.
- Whitelist is stored using Chrome's `storage.sync` and applied before creating alerts.

License: MIT
