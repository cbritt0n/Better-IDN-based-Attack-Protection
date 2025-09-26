# Better IDN-based Attack Protection

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-blue)](https://chrome.google.com/webstore)
[![Edge Extension](https://img.shields.io/badge/edge-extension-blue)](https://microsoftedge.microsoft.com/addons)
[![Tests](https://img.shields.io/badge/tests-100%25%20passing-brightgreen)](#testing)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](better-idn-protection/docs/LICENSE)

I built a little browser extension that provides protection against IDN (Internationalized Domain Name) homograph phishing attacks. This extension detects suspicious domain names that use mixed scripts and Unicode characters to impersonate legitimate websites. Use at your own risk.

## 🧪 Test the Extension

**Try it live**: [https://xn--christinbritton-nlb.weebly.com/](https://xn--christinbritton-nlb.weebly.com/)  
*This test site demonstrates IDN-based attacks using mixed script characters (punycode encoding). The extension should detect and warn about this suspicious domain. Visit this site after installing the extension to see the protection in action.*

**What you'll see:**
- 🚨 Alert popup window warning about the suspicious domain
- 🔍 Extension popup showing threat details
- ⚡ Real-time detection without page reload needed

## 🛡️ Features

- **Real-time Protection**: Monitors web navigation and detects suspicious domains instantly
- **Mixed Script Detection**: Advanced algorithm to identify domains mixing different Unicode script families
- **Smart Notifications**: Non-intrusive alerts when suspicious domains are detected
- **Whitelist Management**: Easy-to-use interface for managing trusted domains
- **Cross-Browser Support**: Works on both Chrome and Edge browsers
- **Zero Performance Impact**: Lightweight and efficient background processing
- **Privacy-Focused**: No data collection or external communications

## 🚀 Quick Start

### Installation

1. **Download** the latest `extension.zip` from [releases](https://github.com/cbritt0n/Better-IDN-based-Attack-Protection/releases)
2. **Extract** to a folder
3. **Open** Chrome/Edge extensions page (`chrome://extensions/` or `edge://extensions/`)
4. **Enable** "Developer mode"
5. **Click** "Load unpacked" and select the folder

### For Developers

```bash
# Clone and setup
git clone https://github.com/cbritt0n/Better-IDN-based-Attack-Protection.git
cd Better-IDN-based-Attack-Protection/better-idn-protection

# Install dependencies and build
npm install
npm run build

# Load the dist/ folder as unpacked extension
```

## 📁 Project Structure

```
better-idn-protection/
├── src/
│   ├── js/                     # JavaScript source files
│   │   ├── app.js             # Main content script logic
│   │   ├── bg.js              # Background service worker
│   │   ├── popup.js           # Popup interface logic
│   │   ├── punycode.js        # Punycode conversion utilities
│   │   └── unicode_blocks.json # Unicode block definitions
│   ├── html/                   # HTML files
│   │   └── popup.html         # Extension popup interface
│   ├── css/                    # Stylesheets
│   │   └── popup.css          # Popup interface styles
│   └── assets/                 # Static assets
│       ├── icon16.png         # 16x16 icon
│       ├── icon32.png         # 32x32 icon
│       ├── icon128.png        # 128x128 icon
│       └── icon.png           # Default icon
├── test/                       # Test suites
│   ├── unit/                   # Unit tests
│   └── e2e/                    # End-to-end tests
├── scripts/                    # Build and utility scripts
├── docs/                       # Documentation
├── dist/                       # Built extension (generated)
├── manifest.json              # Extension manifest
└── package.json               # Node.js dependencies and scripts
```

## 🧪 Testing

The project maintains **100% test success rate** with comprehensive coverage:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:e2e

# Development validation
npm run validate
```

### Test Coverage
- **Unit Tests**: Core functionality, Unicode detection, domain parsing
- **Integration Tests**: Chrome API interactions, storage management
- **End-to-End Tests**: Full user workflows using Playwright
- **Production Tests**: Build validation, manifest verification

## 🔧 Development

### Available Scripts
- `npm test` - Run all tests (unit + integration)
- `npm run test:unit` - Run unit tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run build` - Build extension for distribution
- `npm run pack` - Create extension.zip package
- `npm run validate` - Run linting and all tests

### Prerequisites
- Node.js 18+
- npm 10+
- Chrome or Edge browser

## 🛠️ How It Works

### Detection Algorithm
1. **Domain Monitoring**: Intercepts navigation events to analyze URLs
2. **Unicode Analysis**: Examines each character's Unicode block classification
3. **Script Mixing Detection**: Identifies suspicious combinations of different writing systems
4. **Whitelist Check**: Verifies against user-approved domains
5. **Alert System**: Displays warnings for potential threats

### Attack Types Detected
- **Cyrillic/Latin Mix**: е.g., `gооgle.com` (using Cyrillic 'о')
- **Greek/Latin Mix**: e.g., `αpple.com` (using Greek 'α')
- **Mixed CJK**: Chinese, Japanese, Korean character substitutions
- **Complex Scripts**: Arabic, Hebrew, and other script mixing attacks

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|---------|
| Chrome | 88+ | ✅ Fully Supported |
| Edge | 88+ | ✅ Fully Supported |
| Firefox | N/A | 🔄 Planned (Manifest V2 port) |

## 🔐 Security & Privacy

- ✅ **No external data transmission**
- ✅ **Local-only processing**
- ✅ **No user tracking**
- ✅ **Minimal permissions required**
- ✅ **Open source and auditable**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](better-idn-protection/docs/CONTRIBUTING.md) for detailed information.

**Quick Start**:
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `npm run validate` to ensure quality
5. Submit a pull request

### Code Quality Standards
- **100% test coverage** for new features
- **ESLint compliance** with project rules
- **Comprehensive documentation** for public APIs
- **Security-first** development practices

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](better-idn-protection/docs/LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/cbritt0n/Better-IDN-based-Attack-Protection/issues)
- **Security Issues**: See our [Security Policy](better-idn-protection/docs/SECURITY.md) for reporting guidelines
- **Development Guide**: [Development Documentation](better-idn-protection/docs/DEVELOPMENT.md)
- **API Reference**: [API Documentation](better-idn-protection/docs/API.md)
- **Contributing**: [Contributing Guidelines](better-idn-protection/docs/CONTRIBUTING.md)

## 🔗 Resources

- [OWASP IDN Homograph Attacks](https://owasp.org/www-community/attacks/IDN_homograph_attack)
- [Unicode Security Considerations](https://unicode.org/reports/tr36/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)

---

