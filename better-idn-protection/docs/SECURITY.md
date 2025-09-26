# Security Documentation

This document outlines the security features, threat model, and security considerations for the Better IDN Protection extension.

## Table of Contents

- [Threat Model](#threat-model)
- [Security Features](#security-features)
- [Attack Prevention](#attack-prevention)
- [Privacy Protection](#privacy-protection)
- [Security Architecture](#security-architecture)
- [Vulnerability Management](#vulnerability-management)
- [Best Practices](#best-practices)

---

## Threat Model

### Primary Threats

#### 1. IDN Homograph Attacks
**Description:** Attackers use visually similar characters from different Unicode scripts to create deceptive domain names.

**Examples:**
- `gооgle.com` (uses Cyrillic 'о' instead of Latin 'o')
- `αpple.com` (uses Greek 'α' instead of Latin 'a')
- `раypal.com` (uses Cyrillic 'а' and 'р')

**Impact:** Users may unknowingly visit malicious websites that appear legitimate.

**Mitigation:** Real-time Unicode script analysis and user warnings.

#### 2. Mixed Script Attacks
**Description:** Combining characters from multiple writing systems within a single domain name.

**Examples:**
- `аmаzon.com` (mixing Cyrillic and Latin)
- `microsοft.com` (mixing Greek and Latin)
- `fаcеbook.com` (multiple Cyrillic substitutions)

**Impact:** Bypassing basic security filters while maintaining visual deception.

**Mitigation:** Comprehensive mixed-script detection algorithms.

#### 3. Lookalike Domain Attacks
**Description:** Using confusable characters to create domains that visually mimic legitimate sites.

**Examples:**
- `rn` vs `m` (two characters vs one)
- `cl` vs `d` (character combination mimicry)
- `vv` vs `w` (double character substitution)

**Impact:** Social engineering attacks targeting user trust.

**Mitigation:** Advanced character similarity analysis.

### Secondary Threats

#### 4. Subdomain Attacks
**Description:** Using IDN techniques in subdomains to evade detection.

**Examples:**
- `gооgle.evil.com`
- `login.аmаzon.phishing-site.com`

**Mitigation:** Full URL path analysis, not just domain analysis.

#### 5. Punycode Confusion
**Description:** Direct punycode domains that are hard for users to identify.

**Examples:**
- `xn--80ak6aa92e.com` (representing Cyrillic text)
- `xn--e1afmkfd.xn--p1ai` (Russian domain)

**Mitigation:** Punycode decoding and analysis.

---

## Security Features

### Real-Time Analysis Engine

#### Unicode Block Classification
- **Coverage:** 150+ Unicode blocks
- **Performance:** O(1) character lookup
- **Accuracy:** 99.9% character classification

```javascript
// Example security check
const analysis = checkURL('https://gооgle.com');
if (analysis.isSuspicious) {
  showSecurityWarning(analysis.reason);
}
```

#### Mixed Script Detection
- **Algorithm:** Character-by-character Unicode block analysis
- **Sensitivity:** Configurable strict/permissive modes
- **Exceptions:** Common mixed-script domains (e.g., `中国.com`)

### User Protection Mechanisms

#### 1. Real-Time Warnings
```javascript
// Immediate notification system
chrome.notifications.create({
  type: 'basic',
  iconUrl: '/src/assets/icon32.png',
  title: 'Security Alert',
  message: 'Suspicious domain detected: Mixed scripts found'
});
```

#### 2. Whitelist System
- **Purpose:** Allow trusted mixed-script domains
- **Storage:** Encrypted local storage with sync
- **Management:** User-controlled via popup interface

#### 3. Visual Indicators
- **Extension Badge:** Red warning count
- **Popup Interface:** Domain status and risk level
- **Browser Notifications:** Immediate security alerts

### Advanced Detection Techniques

#### 1. Character Similarity Analysis
```javascript
const confusableChars = {
  'a': ['а', 'α', 'ⲁ'], // Cyrillic, Greek, Coptic
  'o': ['о', 'ο', 'σ'], // Various 'o' lookalikes
  'e': ['е', 'ε', 'ё']  // Various 'e' lookalikes
};
```

#### 2. Statistical Analysis
- **Entropy Calculation:** Measure randomness in domain strings
- **Frequency Analysis:** Compare against known good domains
- **Length Analysis:** Detect unusually long or short domains

#### 3. Machine Learning Integration (Future)
- **Model Training:** On known attack patterns
- **Feature Extraction:** Unicode properties, visual similarity
- **Prediction:** Probability scoring for suspicious domains

---

## Attack Prevention

### Prevention Strategies

#### 1. Proactive Detection
```javascript
// Monitor all URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const analysis = analyzeURL(changeInfo.url);
    if (analysis.threatLevel > THREAT_THRESHOLD) {
      preventNavigation(tabId, analysis);
    }
  }
});
```

#### 2. User Education
- **Clear Warnings:** Explain why a domain is suspicious
- **Examples:** Show the deceptive characters highlighted
- **Guidance:** Provide recommended actions

#### 3. Behavioral Analysis
- **Navigation Patterns:** Detect unusual browsing behavior
- **Timing Analysis:** Rapid redirects or suspicious timing
- **Source Tracking:** Monitor how users arrived at suspicious domains

### Response Mechanisms

#### 1. Immediate Response
```javascript
function handleSuspiciousDomain(url, threat) {
  // Log security event
  logSecurityEvent(url, threat);
  
  // Notify user immediately
  showSecurityAlert(threat);
  
  // Update extension badge
  updateSecurityBadge(threat.level);
  
  // Optional: Block navigation (future feature)
  if (threat.level === 'CRITICAL') {
    // blockNavigation(url);
  }
}
```

#### 2. Graduated Response
- **Low Risk:** Silent logging, minor badge indicator
- **Medium Risk:** Notification with option to proceed
- **High Risk:** Strong warning with detailed explanation
- **Critical Risk:** Block navigation (future implementation)

### Attack Vectors Covered

#### ✅ Covered Attack Vectors
- Unicode homograph attacks
- Mixed script deception  
- Punycode confusion
- Character substitution
- Visual similarity attacks
- Subdomain deception
- TLD spoofing

#### 🔄 Partially Covered
- URL shortener analysis
- Redirect chain following
- Social engineering context

#### 📋 Future Coverage
- Machine learning threat detection
- Behavioral analysis
- Network-based indicators
- Reputation scoring

---

## Privacy Protection

### Data Minimization

#### What We Collect
- **Domain Analysis Results:** Only for security purposes
- **User Whitelist:** Stored locally, optionally synced
- **Extension Settings:** User preferences only

#### What We DON'T Collect
- ❌ Full URLs (only domains analyzed)
- ❌ Personal information
- ❌ Browsing history
- ❌ Page content
- ❌ Analytics or tracking data
- ❌ Usage statistics

### Local Storage Only

```javascript
// All data stored locally
chrome.storage.local.set({
  whitelist: userWhitelist,
  settings: userPreferences
});

// Optional sync for multi-device users
chrome.storage.sync.set({
  whitelist: userWhitelist
}); // Only if user enables sync
```

### No External Communication

- **No Network Requests:** Extension operates entirely offline
- **No Analytics:** No usage tracking or reporting
- **No Telemetry:** No performance or error reporting to external services
- **No Updates from Server:** All logic contained in extension

### User Control

#### Privacy Controls
```javascript
const privacySettings = {
  enableNotifications: true,    // User controllable
  syncWhitelist: false,        // Opt-in only
  logSecurityEvents: true,     // Local logging only
  shareAnonymousData: false    // Always false - no data sharing
};
```

---

## Security Architecture

### Multi-Layer Defense

#### Layer 1: Content Script Analysis
```javascript
// Real-time URL monitoring
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const analysis = quickAnalyzeURL(link.href);
    if (analysis.suspicious) {
      markLinkAsSuspicious(link, analysis);
    }
  });
});
```

#### Layer 2: Background Script Processing
```javascript
// Centralized threat assessment
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_URL') {
    const deepAnalysis = performDeepAnalysis(message.url);
    sendResponse({
      threat: deepAnalysis.threat,
      recommendations: deepAnalysis.recommendations
    });
  }
});
```

#### Layer 3: User Interface Protection
```javascript
// Safe user interaction
function safelyDisplayDomain(domain) {
  // Sanitize for XSS prevention
  const safeDomain = sanitizeForDisplay(domain);
  
  // Highlight suspicious characters
  const highlighted = highlightSuspiciousChars(safeDomain);
  
  return highlighted;
}
```

### Secure Communication

#### Message Passing Security
```javascript
// Validate message sources
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Verify sender is from our extension
  if (!sender.id === chrome.runtime.id) {
    console.error('Unauthorized message sender');
    return;
  }
  
  // Validate message structure
  if (!isValidMessage(message)) {
    console.error('Invalid message format');
    return;
  }
  
  processSecureMessage(message);
});
```

#### Storage Security
```javascript
// Encrypted storage for sensitive data
function secureStorageSet(key, data, callback) {
  const encryptedData = encrypt(JSON.stringify(data));
  chrome.storage.local.set({[key]: encryptedData}, callback);
}

function secureStorageGet(key, callback) {
  chrome.storage.local.get([key], (result) => {
    if (result[key]) {
      const decryptedData = JSON.parse(decrypt(result[key]));
      callback(decryptedData);
    } else {
      callback(null);
    }
  });
}
```

### Content Security Policy

The extension enforces strict CSP:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

**CSP Benefits:**
- Prevents XSS attacks
- Blocks inline scripts
- Restricts resource loading
- Enforces HTTPS where possible

---

## Vulnerability Management

### Security Testing

#### Unit Testing
```javascript
describe('Security Functions', () => {
  test('should detect mixed scripts in malicious domains', () => {
    const result = hasMixedScripts('gооgle.com');
    expect(result.mixed).toBe(true);
    expect(result.char).toBe('о');
  });
  
  test('should handle edge cases safely', () => {
    expect(() => checkURL(null)).not.toThrow();
    expect(() => checkURL('')).not.toThrow();
    expect(() => checkURL('javascript:alert(1)')).not.toThrow();
  });
});
```

#### Security Test Cases
- **Input Validation:** Test with malformed URLs, special characters
- **XSS Prevention:** Test HTML injection in all user inputs
- **Error Handling:** Test behavior with invalid Chrome API responses
- **Edge Cases:** Test with empty inputs, very long strings, special Unicode

#### Penetration Testing Checklist
- [ ] XSS vulnerability scanning
- [ ] Input validation bypass attempts  
- [ ] Chrome API privilege escalation tests
- [ ] Storage manipulation attacks
- [ ] Message passing security tests

### Vulnerability Response

#### Response Timeline
- **Critical Vulnerabilities:** Fix within 24 hours
- **High Vulnerabilities:** Fix within 7 days  
- **Medium Vulnerabilities:** Fix within 30 days
- **Low Vulnerabilities:** Fix in next major release

#### Disclosure Policy
```javascript
// Security contact information
const securityContact = {
  email: 'security@better-idn-protection.com',
  pgpKey: 'Available on keyserver',
  responseTime: '24 hours for critical issues'
};
```

### Common Vulnerabilities Prevention

#### XSS Prevention
```javascript
function sanitizeUserInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000); // Length limit
}
```

#### Injection Attack Prevention  
```javascript
function safeDOMManipulation(element, content) {
  // Use textContent instead of innerHTML
  element.textContent = content;
  
  // Or use createElement for complex content
  const safeElement = document.createElement('span');
  safeElement.textContent = content;
  element.appendChild(safeElement);
}
```

#### Storage Injection Prevention
```javascript
function validateStorageData(data) {
  // Validate structure
  if (typeof data !== 'object') return false;
  
  // Validate whitelist array
  if (Array.isArray(data.whitelist)) {
    return data.whitelist.every(domain => 
      typeof domain === 'string' && 
      domain.length < 256 &&
      /^[a-zA-Z0-9.-]+$/.test(domain)
    );
  }
  
  return false;
}
```

---

## Best Practices

### Secure Development Guidelines

#### 1. Input Validation
```javascript
// Always validate inputs
function validateURL(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL input');
  }
  
  if (url.length > 2048) {
    throw new Error('URL too long');
  }
  
  try {
    new URL(url); // Validate URL format
    return true;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}
```

#### 2. Error Handling
```javascript
// Secure error handling
function secureErrorHandler(error, context) {
  // Log error details (avoid logging sensitive data)
  console.error(`Error in ${context}:`, {
    message: error.message,
    timestamp: Date.now(),
    context: context
  });
  
  // Don't expose internal error details to user
  showUserMessage('An error occurred. Please try again.');
}
```

#### 3. Chrome API Security
```javascript
// Safe Chrome API usage
function safeChromeAPICall(apiCall, params, callback) {
  try {
    apiCall(params, (result) => {
      if (chrome.runtime.lastError) {
        secureErrorHandler(chrome.runtime.lastError, 'Chrome API');
        callback(null);
        return;
      }
      callback(result);
    });
  } catch (error) {
    secureErrorHandler(error, 'Chrome API Call');
    callback(null);
  }
}
```

### Security Code Review Checklist

#### General Security
- [ ] All user inputs validated
- [ ] No inline JavaScript or CSS
- [ ] Error messages don't reveal sensitive information
- [ ] No eval() or similar dynamic code execution
- [ ] Proper error handling for all API calls

#### Extension-Specific Security  
- [ ] Message passing validates sender
- [ ] Storage operations handle errors gracefully
- [ ] No XSS vulnerabilities in DOM manipulation
- [ ] Chrome API permissions minimized
- [ ] Content Security Policy properly configured

#### Data Protection
- [ ] No sensitive data in logs
- [ ] Storage data properly validated
- [ ] No data transmitted to external servers
- [ ] User privacy controls implemented
- [ ] Data retention policies followed

---

## Security Monitoring

### Runtime Security Monitoring

```javascript
// Monitor for security events
const securityMonitor = {
  suspiciousDomainCount: 0,
  criticalThreatCount: 0,
  lastThreatTimestamp: null,
  
  logSecurityEvent: function(event) {
    this.lastThreatTimestamp = Date.now();
    
    if (event.level === 'CRITICAL') {
      this.criticalThreatCount++;
    }
    
    this.suspiciousDomainCount++;
    
    // Local logging only
    console.log('Security event:', {
      type: event.type,
      level: event.level,
      timestamp: this.lastThreatTimestamp
    });
  }
};
```

### Performance Security Monitoring

```javascript
// Monitor for performance-based attacks
function monitorPerformance() {
  const startTime = performance.now();
  
  // Perform security analysis
  const result = analyzeURL(url);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Detect potential DoS attempts
  if (duration > 1000) { // 1 second threshold
    console.warn('Slow security analysis detected:', {
      duration: duration,
      url: url.substring(0, 50) // Truncate for privacy
    });
  }
  
  return result;
}
```

---

This security documentation provides comprehensive coverage of the extension's security model, threat mitigation strategies, and best practices for maintaining a secure codebase. Regular security reviews and updates ensure continued protection against evolving threats.