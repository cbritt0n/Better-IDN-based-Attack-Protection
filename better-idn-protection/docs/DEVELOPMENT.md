# Development Guide

This guide covers advanced development topics for the Better IDN Protection extension.

## Architecture Overview

### Core Components

#### Content Script (`src/js/app.js`)
- **Purpose**: Runs on every webpage to analyze URLs in real-time
- **Key Functions**:
  - `hasMixedScripts()`: Detects mixed Unicode script usage
  - `getUnicodeBlock()`: Classifies characters by Unicode block
  - `checkURL()`: Main URL analysis function
  - `extractDomain()`: Parses domains from URLs

#### Background Script (`src/js/bg.js`)
- **Purpose**: Service worker for notifications and popup management
- **Key Functions**:
  - `updateLastActiveTab()`: Tracks current tab for notifications
  - Notification creation and management
  - Popup window handling

#### Popup Interface (`src/js/popup.js`)
- **Purpose**: User interface for whitelist management
- **Key Functions**:
  - `setCurrentDomain()`: Display current domain status
  - `addToWhitelist()` / `removeFromWhitelist()`: Whitelist management
  - `isDomainWhitelisted()`: Check whitelist status

### Data Flow

```
Website Load → Content Script Analysis → Background Script Processing → User Notification
                     ↓
               Whitelist Check → Popup Interface Update
```

## Development Environment

### Prerequisites

```bash
# Check Node.js version
node --version  # Should be 18+
npm --version   # Should be 10+

# Verify Chrome/Edge installation
google-chrome --version  # or
microsoft-edge --version
```

### Local Development Setup

1. **Initial Setup**
   ```bash
   git clone https://github.com/cbritt0n/Better-IDN-based-Attack-Protection.git
   cd Better-IDN-based-Attack-Protection/better-idn-protection
   npm install
   ```

2. **Development Build**
   ```bash
   npm run build:dev  # Development build
   npm run build      # Production build
   ```

3. **Load Extension in Browser**
   - Navigate to `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

### Hot Reload Development

For rapid development, use the watch mode:

```bash
# Terminal 1: Watch for changes and rebuild
npm run test:watch

# Terminal 2: Monitor for file changes
watch -n 1 'npm run build:dev'
```

After making changes:
1. Save your files
2. Click the reload button in browser extension management
3. Test the changes

## Code Style and Standards

### ESLint Configuration

The project uses a strict ESLint configuration:

```javascript
// Key rules from .eslintrc.js
{
  'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'no-console': 'off', // Allowed for debugging
  'semi': ['error', 'always'],
  'quotes': ['error', 'single'],
  'indent': ['error', 2]
}
```

### Code Organization

#### Function Naming
- **Public APIs**: `camelCase` (e.g., `checkURL`, `hasMixedScripts`)
- **Internal helpers**: `_camelCase` (e.g., `_parseUnicodeData`)
- **Event handlers**: `onEventName` (e.g., `onTabUpdate`)

#### File Structure
```javascript
// File header with description
// Global constants
// Utility functions
// Main functionality
// Event listeners and initialization
```

#### Error Handling
```javascript
// Always use try-catch for Chrome API calls
try {
  chrome.storage.sync.get(keys, callback);
} catch (error) {
  console.error('Storage access failed:', error);
  // Fallback logic
}
```

## Testing Framework

### Test Structure

```
test/
├── unit/           # Unit tests for individual functions
│   ├── app.test.js         # Content script tests
│   ├── background.test.js  # Background script tests
│   ├── popup.test.js       # Popup interface tests
│   ├── production.test.js  # Production validation tests
│   └── setup.js           # Test environment setup
└── e2e/            # End-to-end tests
    ├── tests/              # Test scenarios
    ├── utils/              # Test utilities
    └── extension.spec.js   # Main E2E test file
```

### Writing Unit Tests

Example test structure:

```javascript
describe('Mixed Script Detection', () => {
  beforeEach(() => {
    // Setup test environment
    global.chrome = mockChromeAPI();
  });

  test('should detect Cyrillic/Latin mixing', () => {
    const result = hasMixedScripts('gооgle.com');
    expect(result.mixed).toBe(true);
    expect(result.char).toBe('о'); // Cyrillic 'o'
  });

  test('should handle edge cases', () => {
    expect(hasMixedScripts('')).toEqual({ mixed: false });
    expect(hasMixedScripts('123.com')).toEqual({ mixed: false });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:e2e          # E2E tests only
npm run test:watch        # Watch mode

# Run with coverage
npm run test:unit -- --coverage
```

### Test Coverage Goals

- **Critical Functions**: 100% coverage
- **Edge Cases**: All scenarios covered
- **Error Handling**: All error paths tested
- **Chrome API Interactions**: Fully mocked and tested

## Chrome Extension APIs

### Key APIs Used

#### Storage API
```javascript
// Saving data
chrome.storage.sync.set({ whitelist: domains }, callback);

// Reading data
chrome.storage.sync.get(['whitelist'], (result) => {
  const whitelist = result.whitelist || [];
});
```

#### Runtime API
```javascript
// Content script to background communication
chrome.runtime.sendMessage({
  type: 'SUSPICIOUS_DOMAIN',
  url: 'example.com',
  details: { char: 'α', block: 'Greek' }
});

// Background script listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUSPICIOUS_DOMAIN') {
    showNotification(message);
  }
});
```

#### Tabs API
```javascript
// Get current tab information
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  // Process tab information
});
```

### API Error Handling

Always check for Chrome runtime errors:

```javascript
function safeStorageGet(keys, callback) {
  chrome.storage.sync.get(keys, (result) => {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      callback(null); // Provide fallback
      return;
    }
    callback(result);
  });
}
```

## Performance Optimization

### Memory Management

1. **Avoid Memory Leaks**
   ```javascript
   // Remove event listeners when not needed
   chrome.tabs.onUpdated.removeListener(tabUpdateHandler);
   
   // Clear intervals and timeouts
   clearInterval(intervalId);
   ```

2. **Efficient Data Structures**
   ```javascript
   // Use Sets for fast lookups
   const whitelistSet = new Set(whitelistArray);
   
   // Cache frequently used data
   const unicodeBlockCache = new Map();
   ```

### CPU Optimization

1. **Debounce Frequent Operations**
   ```javascript
   function debounce(func, wait) {
     let timeout;
     return function executedFunction(...args) {
       const later = () => {
         clearTimeout(timeout);
         func(...args);
       };
       clearTimeout(timeout);
       timeout = setTimeout(later, wait);
     };
   }
   ```

2. **Lazy Loading**
   ```javascript
   // Load Unicode data only when needed
   let unicodeBlocks = null;
   function getUnicodeBlocks() {
     if (!unicodeBlocks) {
       unicodeBlocks = loadUnicodeData();
     }
     return unicodeBlocks;
   }
   ```

## Security Considerations

### Input Validation

```javascript
function sanitizeURL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch (error) {
    console.warn('Invalid URL:', url);
    return null;
  }
}
```

### Content Security Policy

The extension follows strict CSP guidelines:
- No inline scripts or styles
- No eval() usage
- Restricted external resource loading

### Data Protection

- All user data stays local (no external transmission)
- Whitelist data encrypted in Chrome storage
- No tracking or analytics

## Debugging Techniques

### Chrome DevTools

1. **Extension Debugging**
   - Background script: `chrome://extensions/` → "Inspect views: background page"
   - Content script: Open DevTools on the webpage
   - Popup: Right-click popup → "Inspect"

2. **Console Logging**
   ```javascript
   // Use different log levels
   console.log('General info');
   console.warn('Warning condition');
   console.error('Error occurred');
   console.debug('Debug information'); // Only in debug builds
   ```

3. **Network Monitoring**
   ```javascript
   // Monitor for unexpected network requests
   chrome.webRequest.onBeforeRequest.addListener(
     (details) => console.log('Request:', details.url),
     { urls: ['<all_urls>'] }
   );
   ```

### Common Issues and Solutions

#### Issue: Extension not loading
- **Check**: Manifest syntax errors
- **Solution**: Validate JSON with `npm run lint`

#### Issue: Content script not running
- **Check**: Match patterns in manifest
- **Solution**: Verify `content_scripts.matches` covers target sites

#### Issue: Storage not persisting
- **Check**: Storage API permissions
- **Solution**: Ensure `storage` permission in manifest

## Build and Deployment

### Build Process

1. **Development Build**
   ```bash
   npm run build:dev
   # Creates dist/ with unminified code
   ```

2. **Production Build**
   ```bash
   npm run build
   # Creates optimized dist/ for store submission
   ```

3. **Package Creation**
   ```bash
   npm run pack
   # Creates extension.zip ready for upload
   ```

### Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Extension loads without errors
- [ ] All features working in Chrome and Edge
- [ ] Manifest version incremented
- [ ] Icons and assets optimized
- [ ] Documentation updated

### Store Submission

1. **Chrome Web Store**
   - Create developer account
   - Upload `extension.zip`
   - Complete store listing
   - Submit for review

2. **Microsoft Edge Add-ons**
   - Register as Edge developer
   - Upload same `extension.zip`
   - Fill out marketplace details
   - Submit for approval

## Contributing Guidelines

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with tests
4. Run validation: `npm run validate`
5. Commit with descriptive message
6. Push branch and create PR

### Code Review Criteria

- ✅ All tests pass
- ✅ No linting errors
- ✅ Security considerations addressed
- ✅ Performance impact minimal
- ✅ Documentation updated
- ✅ Backward compatibility maintained

---

## Additional Resources

- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [Unicode Standard Documentation](https://unicode.org/standard/standard.html)
- [Web Security Best Practices](https://web.dev/security/)