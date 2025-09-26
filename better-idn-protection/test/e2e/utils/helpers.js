// E2E test utilities and helpers
const path = require('path');

/**
 * Extension test utilities for Better IDN Protection
 */
class ExtensionTestHelpers {
  constructor() {
    this.extensionPath = path.resolve(__dirname, '../../');
  }

  /**
   * Create a browser context with the extension loaded
   * @param {Browser} browser - Playwright browser instance
   * @returns {Promise<BrowserContext>} Browser context with extension
   */
  async createExtensionContext(browser) {
    return browser.newContext({
      args: [
        `--disable-extensions-except=${this.extensionPath}`,
        `--load-extension=${this.extensionPath}`,
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  /**
   * Get extension ID from the loaded context
   * @param {BrowserContext} context - Browser context with extension
   * @returns {Promise<string>} Extension ID
   */
  async getExtensionId(context) {
    try {
      const backgroundPage = await context.waitForEvent('page', {
        predicate: page => page.url().includes('chrome-extension://'),
        timeout: 5000
      });
      return backgroundPage.url().split('/')[2];
    } catch (error) {
      // Fallback: try to get from service worker
      const serviceWorkers = context.serviceWorkers();
      if (serviceWorkers.length > 0) {
        const swUrl = serviceWorkers[0].url();
        return swUrl.split('/')[2];
      }
      throw new Error('Could not determine extension ID');
    }
  }

  /**
   * Create a test page with mixed script content
   * @param {string} domain - Domain to simulate
   * @param {string} suspiciousChar - Suspicious character to include
   * @returns {string} HTML content for test page
   */
  createMixedScriptTestPage(domain, suspiciousChar = 'α') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Page - ${domain}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>Test Page for ${domain}</h1>
        <p>This page contains mixed script character: ${suspiciousChar}</p>
        <p>Used for testing IDN homograph attack detection.</p>
        <script>
          // Simulate some basic JavaScript
          console.log('Test page loaded');
          window.testPageLoaded = true;
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Wait for extension to initialize on a page
   * @param {Page} page - Playwright page instance
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForExtensionInit(page, timeout = 2000) {
    await page.waitForTimeout(timeout);

    // Wait for Chrome extension APIs to be available
    await page.waitForFunction(() => {
      return typeof window.chrome !== 'undefined' &&
             typeof window.chrome.runtime !== 'undefined';
    }, { timeout });
  }

  /**
   * Send message to extension background script
   * @param {Page} page - Playwright page instance
   * @param {Object} message - Message to send
   * @returns {Promise<any>} Response from background script
   */
  async sendMessageToBackground(page, message) {
    return await page.evaluate((msg) => {
      return new Promise((resolve) => {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage(msg, (response) => {
            resolve(response || null);
          });
        } else {
          resolve(null);
        }
      });
    }, message);
  }

  /**
   * Check if extension is properly loaded
   * @param {BrowserContext} context - Browser context
   * @returns {Promise<boolean>} True if extension is loaded
   */
  async isExtensionLoaded(context) {
    try {
      const serviceWorkers = context.serviceWorkers();
      return serviceWorkers.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get extension popup URL
   * @param {string} extensionId - Extension ID
   * @param {string} domain - Optional domain parameter
   * @returns {string} Popup URL
   */
  getPopupUrl(extensionId, domain = null) {
    let url = `chrome-extension://${extensionId}/popup.html`;
    if (domain) {
      url += `?domain=${encodeURIComponent(domain)}`;
    }
    return url;
  }

  /**
   * Test notification permissions
   * @param {Page} page - Playwright page instance
   * @returns {Promise<boolean>} True if notifications are allowed
   */
  async checkNotificationPermissions(page) {
    return await page.evaluate(() => {
      return Notification.permission === 'granted';
    });
  }

  /**
   * Clear extension storage
   * @param {Page} page - Playwright page instance
   */
  async clearExtensionStorage(page) {
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (window.chrome && window.chrome.storage) {
          chrome.storage.sync.clear(() => {
            chrome.storage.local.clear(() => {
              resolve();
            });
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Set whitelist in extension storage
   * @param {Page} page - Playwright page instance
   * @param {Array<string>} domains - Domains to whitelist
   */
  async setWhitelist(page, domains) {
    await page.evaluate((domainList) => {
      return new Promise((resolve) => {
        if (window.chrome && window.chrome.storage) {
          chrome.storage.sync.set({ whitelist: domainList }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    }, domains);
  }

  /**
   * Get whitelist from extension storage
   * @param {Page} page - Playwright page instance
   * @returns {Promise<Array<string>>} Whitelisted domains
   */
  async getWhitelist(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        if (window.chrome && window.chrome.storage) {
          chrome.storage.sync.get(['whitelist'], (result) => {
            resolve(result.whitelist || []);
          });
        } else {
          resolve([]);
        }
      });
    });
  }

  /**
   * Create test domains with mixed scripts
   * @returns {Array<Object>} Array of test domain objects
   */
  getTestDomains() {
    return [
      {
        name: 'normal.com',
        suspicious: false,
        description: 'Normal ASCII domain'
      },
      {
        name: 'gοοgle.com', // Contains Greek omicron
        suspicious: true,
        char: 'ο',
        block: 'Greek',
        description: 'Greek omicron instead of Latin o'
      },
      {
        name: 'аpple.com', // Contains Cyrillic а
        suspicious: true,
        char: 'а',
        block: 'Cyrillic',
        description: 'Cyrillic а instead of Latin a'
      },
      {
        name: 'microsoft.com',
        suspicious: false,
        description: 'Normal domain for testing'
      }
    ];
  }

  /**
   * Wait for element to be present and visible
   * @param {Page} page - Playwright page instance
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(page, selector, timeout = 5000) {
    await page.waitForSelector(selector, {
      state: 'visible',
      timeout
    });
  }

  /**
   * Check for console errors on page
   * @param {Page} page - Playwright page instance
   * @returns {Promise<Array<string>>} Array of error messages
   */
  async getConsoleErrors(page) {
    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any errors to appear
    await page.waitForTimeout(1000);

    return errors;
  }

  /**
   * Simulate user interaction with popup elements
   * @param {Page} popupPage - Popup page instance
   * @param {string} action - Action to perform ('add', 'remove', 'clear')
   */
  async interactWithPopup(popupPage, action) {
    await popupPage.waitForTimeout(500); // Wait for popup to initialize

    switch (action) {
    case 'add':
      await popupPage.click('#add-wl');
      break;
    case 'remove':
      await popupPage.click('#remove-wl');
      break;
    case 'clear':
      await popupPage.click('#clear-wl');
      break;
    default:
      throw new Error(`Unknown popup action: ${action}`);
    }

    await popupPage.waitForTimeout(500); // Wait for action to complete
  }

  /**
   * Check popup button states
   * @param {Page} popupPage - Popup page instance
   * @returns {Promise<Object>} Button states
   */
  async getPopupButtonStates(popupPage) {
    return await popupPage.evaluate(() => {
      const addBtn = document.getElementById('add-wl');
      const removeBtn = document.getElementById('remove-wl');
      const clearBtn = document.getElementById('clear-wl');

      return {
        add: {
          enabled: !addBtn.disabled,
          visible: addBtn.style.display !== 'none'
        },
        remove: {
          enabled: !removeBtn.disabled,
          visible: removeBtn.style.display !== 'none'
        },
        clear: {
          enabled: !clearBtn.disabled,
          visible: clearBtn.style.display !== 'none'
        }
      };
    });
  }
}

module.exports = { ExtensionTestHelpers };
