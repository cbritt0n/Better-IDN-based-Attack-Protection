# API Documentation

This document provides detailed API documentation for the Better IDN Protection extension's core functions and interfaces.

## Table of Contents

- [Content Script API](#content-script-api)
- [Background Script API](#background-script-api)
- [Popup Interface API](#popup-interface-api)
- [Storage Interface](#storage-interface)
- [Utility Functions](#utility-functions)
- [Chrome Extension APIs](#chrome-extension-apis)

---

## Content Script API

### `hasMixedScripts(text)`

Analyzes text for mixed Unicode script usage, which is a common technique in IDN homograph attacks.

**Parameters:**
- `text` (string): The text to analyze

**Returns:**
- `Object`: Analysis result
  - `mixed` (boolean): Whether mixed scripts were detected
  - `char` (string|null): The problematic character (if any)
  - `scripts` (Array): List of detected scripts

**Example:**
```javascript
const result = hasMixedScripts('gооgle.com');
// Returns: { mixed: true, char: 'о', scripts: ['Latin', 'Cyrillic'] }

const safe = hasMixedScripts('google.com');
// Returns: { mixed: false, char: null, scripts: ['Latin'] }
```

**Use Cases:**
- Real-time URL analysis
- Domain name validation
- Suspicious character detection

---

### `getUnicodeBlock(char)`

Determines the Unicode block of a given character.

**Parameters:**
- `char` (string): Single character to analyze

**Returns:**
- `string|null`: Unicode block name or null if not found

**Example:**
```javascript
getUnicodeBlock('α'); // Returns: 'Greek and Coptic'
getUnicodeBlock('а'); // Returns: 'Cyrillic'
getUnicodeBlock('a'); // Returns: 'Basic Latin'
getUnicodeBlock('🔒'); // Returns: 'Miscellaneous Symbols'
```

**Supported Unicode Blocks:**
- Basic Latin (0000-007F)
- Latin-1 Supplement (0080-00FF)
- Cyrillic (0400-04FF)
- Greek and Coptic (0370-03FF)
- Hebrew (0590-05FF)
- Arabic (0600-06FF)
- And many more...

---

### `checkURL(url)`

Comprehensive URL analysis for IDN-based attacks.

**Parameters:**
- `url` (string): Full URL to analyze

**Returns:**
- `Object`: Analysis result
  - `isSuspicious` (boolean): Whether the URL is potentially malicious
  - `reason` (string): Explanation if suspicious
  - `domain` (string): Extracted domain
  - `mixedScripts` (Object): Mixed script analysis result

**Example:**
```javascript
const result = checkURL('https://gооgle.com/search');
// Returns: {
//   isSuspicious: true,
//   reason: 'Mixed scripts detected: о (Cyrillic)',
//   domain: 'gооgle.com',
//   mixedScripts: { mixed: true, char: 'о', scripts: ['Latin', 'Cyrillic'] }
// }
```

**Detection Criteria:**
- Mixed Unicode scripts
- Homograph characters
- Suspicious TLD combinations
- Known attack patterns

---

### `extractDomain(url)`

Extracts the domain name from a URL.

**Parameters:**
- `url` (string): URL to process

**Returns:**
- `string|null`: Domain name or null if invalid

**Example:**
```javascript
extractDomain('https://example.com/path?query=1');
// Returns: 'example.com'

extractDomain('invalid-url');
// Returns: null
```

---

## Background Script API

### `updateLastActiveTab(tabId, url)`

Updates tracking information for the currently active tab.

**Parameters:**
- `tabId` (number): Chrome tab ID
- `url` (string): Tab URL

**Returns:**
- `void`

**Example:**
```javascript
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateLastActiveTab(tab.id, tab.url);
  });
});
```

---

### Message Handlers

#### `SUSPICIOUS_DOMAIN` Message

Handles notifications from content scripts about suspicious domains.

**Message Format:**
```javascript
{
  type: 'SUSPICIOUS_DOMAIN',
  url: 'suspicious-domain.com',
  details: {
    char: 'о',
    block: 'Cyrillic',
    reason: 'Mixed scripts detected'
  }
}
```

**Response:**
- Creates notification
- Updates extension badge
- Logs security event

---

## Popup Interface API

### `setCurrentDomain(domain)`

Updates the popup interface with current domain information.

**Parameters:**
- `domain` (string): Domain to display

**Returns:**
- `void`

**Example:**
```javascript
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const domain = extractDomain(tabs[0].url);
  setCurrentDomain(domain);
});
```

---

### `isDomainWhitelisted(domain, callback)`

Checks if a domain is in the user's whitelist.

**Parameters:**
- `domain` (string): Domain to check
- `callback` (function): Callback function

**Callback Parameters:**
- `isWhitelisted` (boolean): Whether domain is whitelisted

**Example:**
```javascript
isDomainWhitelisted('example.com', (isWhitelisted) => {
  if (isWhitelisted) {
    console.log('Domain is trusted');
  }
});
```

---

### `addToWhitelist(domain, callback)`

Adds a domain to the user's whitelist.

**Parameters:**
- `domain` (string): Domain to whitelist
- `callback` (function): Completion callback

**Example:**
```javascript
addToWhitelist('trusted-site.com', () => {
  console.log('Domain added to whitelist');
});
```

---

### `removeFromWhitelist(domain, callback)`

Removes a domain from the user's whitelist.

**Parameters:**
- `domain` (string): Domain to remove
- `callback` (function): Completion callback

**Example:**
```javascript
removeFromWhitelist('untrusted-site.com', () => {
  console.log('Domain removed from whitelist');
});
```

---

## Storage Interface

### Whitelist Management

The extension uses Chrome's `storage.sync` API to store user preferences across devices.

#### Data Structure

```javascript
{
  whitelist: [
    'trusted-domain1.com',
    'trusted-domain2.com',
    // ... more domains
  ],
  settings: {
    notificationsEnabled: true,
    strictMode: false,
    lastUpdate: '2024-01-15T10:30:00Z'
  }
}
```

#### Storage Operations

**Save Whitelist:**
```javascript
chrome.storage.sync.set({ whitelist: domains }, (callback) => {
  if (chrome.runtime.lastError) {
    console.error('Storage error:', chrome.runtime.lastError);
    return;
  }
  callback();
});
```

**Load Whitelist:**
```javascript
chrome.storage.sync.get(['whitelist'], (result) => {
  const whitelist = result.whitelist || [];
  // Process whitelist
});
```

---

## Utility Functions

### `_normalizeURL(url)`

Normalizes URLs for consistent processing.

**Parameters:**
- `url` (string): URL to normalize

**Returns:**
- `string`: Normalized URL

**Example:**
```javascript
_normalizeURL('HTTPS://EXAMPLE.COM/PATH');
// Returns: 'https://example.com/path'
```

---

### `_isValidDomain(domain)`

Validates domain name format.

**Parameters:**
- `domain` (string): Domain to validate

**Returns:**
- `boolean`: Whether domain is valid

**Example:**
```javascript
_isValidDomain('example.com'); // Returns: true
_isValidDomain('invalid..domain'); // Returns: false
```

---

### `_sanitizeInput(input)`

Sanitizes user input to prevent XSS attacks.

**Parameters:**
- `input` (string): Input to sanitize

**Returns:**
- `string`: Sanitized input

**Example:**
```javascript
_sanitizeInput('<script>alert("xss")</script>');
// Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
```

---

## Chrome Extension APIs

### Content Script Context

Content scripts have access to:
- DOM of the host page
- Chrome extension APIs (limited subset)
- Communication with background script

**Available APIs:**
- `chrome.runtime.sendMessage()`
- `chrome.storage.*`
- `chrome.i18n.*`

**Example Usage:**
```javascript
// Send message to background script
chrome.runtime.sendMessage({
  type: 'SUSPICIOUS_DOMAIN',
  data: analysisResult
});

// Listen for responses
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_WHITELIST') {
    // Handle whitelist update
    sendResponse({ status: 'updated' });
  }
});
```

---

### Background Script Context

Background scripts have full access to Chrome extension APIs.

**Key APIs Used:**
- `chrome.runtime.*` - Message passing
- `chrome.tabs.*` - Tab management
- `chrome.storage.*` - Data persistence
- `chrome.notifications.*` - User notifications

**Example Usage:**
```javascript
// Create notification
chrome.notifications.create('suspicious-domain', {
  type: 'basic',
  iconUrl: 'icons/warning.png',
  title: 'Suspicious Domain Detected',
  message: 'The domain contains mixed Unicode scripts'
});

// Monitor tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    analyzeTabURL(tab.url);
  }
});
```

---

### Popup Context

Popup scripts have access to Chrome APIs and can communicate with background scripts.

**Common Patterns:**
```javascript
// Get current tab information
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  processCurrentTab(currentTab);
});

// Update extension badge
chrome.action.setBadgeText({
  text: '1',
  tabId: tabId
});

chrome.action.setBadgeBackgroundColor({
  color: '#FF0000',
  tabId: tabId
});
```

---

## Error Handling

### Chrome API Errors

Always check for Chrome runtime errors:

```javascript
function safeAPICall(apiFunction, parameters, callback) {
  apiFunction(parameters, (result) => {
    if (chrome.runtime.lastError) {
      console.error('Chrome API error:', chrome.runtime.lastError.message);
      callback(null, chrome.runtime.lastError);
      return;
    }
    callback(result, null);
  });
}
```

### Network Errors

Handle network-related failures gracefully:

```javascript
function handleNetworkError(error) {
  console.warn('Network operation failed:', error.message);
  // Implement fallback behavior
  showUserNotification('Operation failed. Please try again.');
}
```

### Storage Errors

Implement fallback for storage failures:

```javascript
function loadWhitelistWithFallback(callback) {
  chrome.storage.sync.get(['whitelist'], (result) => {
    if (chrome.runtime.lastError) {
      console.warn('Storage unavailable, using local fallback');
      callback(getLocalFallbackWhitelist());
      return;
    }
    callback(result.whitelist || []);
  });
}
```

---

## Performance Considerations

### Function Optimization

**Debouncing for Frequent Operations:**
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

// Usage
const debouncedAnalyze = debounce(analyzeURL, 300);
```

**Memoization for Expensive Operations:**
```javascript
const memoizedGetUnicodeBlock = (() => {
  const cache = new Map();
  return (char) => {
    if (cache.has(char)) {
      return cache.get(char);
    }
    const block = getUnicodeBlock(char);
    cache.set(char, block);
    return block;
  };
})();
```

### Memory Management

**Clean Up Event Listeners:**
```javascript
// Store references for cleanup
const tabUpdateListener = (tabId, changeInfo, tab) => {
  // Handle tab update
};

// Add listener
chrome.tabs.onUpdated.addListener(tabUpdateListener);

// Clean up when needed
chrome.tabs.onUpdated.removeListener(tabUpdateListener);
```

---

## Security Guidelines

### Input Validation

```javascript
function validateURL(url) {
  try {
    new URL(url); // Throws if invalid
    return url.length < 2048; // Reasonable length limit
  } catch (error) {
    return false;
  }
}
```

### XSS Prevention

```javascript
function safelySetHTML(element, text) {
  element.textContent = text; // Use textContent, not innerHTML
}

function sanitizeForDisplay(userInput) {
  return userInput
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

This API documentation provides comprehensive coverage of all public interfaces and common usage patterns for the Better IDN Protection extension. For implementation details and examples, refer to the source code and development guide.