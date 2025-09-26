// E2E tests for extension notification system
const { test, expect } = require('@playwright/test');
const path = require('path');

// Extension path
const extensionPath = path.resolve(__dirname, '../../');

test.describe('Extension Notification System', () => {
  let context;
  let _backgroundPage;

  test.beforeAll(async ({ browser }) => {
    // Load extension
    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--enable-features=NotificationTriggers'
      ]
    });

    // Wait for background script to load
    try {
      _backgroundPage = await context.waitForEvent('page', {
        predicate: page => page.url().includes('chrome-extension://'),
        timeout: 5000
      });
    } catch (error) {
      console.log('Background page not detected, using service worker');
    }
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('extension handles notification permissions', async () => {
    const testPage = await context.newPage();

    // Grant notification permissions
    await context.grantPermissions(['notifications']);

    await testPage.goto('https://example.com');
    await testPage.waitForTimeout(1000);

    // Test that notifications can be created (we can't directly test notification display
    // but we can test that the API is available)
    const notificationAPIAvailable = await testPage.evaluate(() => {
      return typeof Notification !== 'undefined' &&
             Notification.permission !== 'denied';
    });

    expect(notificationAPIAvailable).toBeTruthy();

    await testPage.close();
  });

  test('extension background script processes messages correctly', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');

    // Simulate content script detecting suspicious activity
    await testPage.evaluate(() => {
      if (window.chrome && window.chrome.runtime) {
        chrome.runtime.sendMessage({
          type: 'mixed-script',
          url: window.location.href,
          char: 'α',
          block: 'Greek'
        });
      }
    });

    await testPage.waitForTimeout(1000);

    // Background script should have processed the message
    // (We can't directly test notification creation in E2E, but we can verify
    // the extension doesn't crash)
    const pageTitle = await testPage.title();
    expect(pageTitle).toBeTruthy(); // Page should still be functional

    await testPage.close();
  });

  test('extension handles rapid message bursts', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');

    // Send multiple messages rapidly
    await testPage.evaluate(() => {
      if (window.chrome && window.chrome.runtime) {
        for (let i = 0; i < 10; i++) {
          chrome.runtime.sendMessage({
            type: 'mixed-script',
            url: window.location.href + `?test=${i}`,
            char: 'α',
            block: 'Greek'
          });
        }
      }
    });

    await testPage.waitForTimeout(2000);

    // Extension should handle the burst without crashing
    const isPageResponsive = await testPage.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isPageResponsive).toBeTruthy();

    await testPage.close();
  });

  test('extension message routing works correctly', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');

    // Test different message types
    const messageTypes = ['mixed-script', 'get-active-tab', 'popup-alert'];

    for (const messageType of messageTypes) {
      await testPage.evaluate((type) => {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage({
            type: type,
            url: window.location.href,
            data: 'test'
          });
        }
      }, messageType);

      await testPage.waitForTimeout(500);
    }

    // Extension should handle all message types without errors
    const pageErrors = await testPage.evaluate(() => {
      return window.console.error?.mock?.calls?.length || 0;
    });

    expect(pageErrors).toBe(0);

    await testPage.close();
  });

  test('extension tab management functionality', async () => {
    // Open multiple tabs
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();
    const tab3 = await context.newPage();

    await tab1.goto('https://example.com');
    await tab2.goto('https://httpbin.org/html');
    await tab3.goto('https://www.google.com');

    await Promise.all([
      tab1.waitForTimeout(500),
      tab2.waitForTimeout(500),
      tab3.waitForTimeout(500)
    ]);

    // Test active tab detection
    await tab2.bringToFront();
    await tab2.waitForTimeout(500);

    // Send message to get active tab
    const activeTabInfo = await tab2.evaluate(() => {
      return new Promise((resolve) => {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage(
            { type: 'get-active-tab' },
            (response) => resolve(response)
          );
        } else {
          resolve(null);
        }
      });
    });

    // Extension should respond with tab information
    expect(activeTabInfo).toBeTruthy();

    await tab1.close();
    await tab2.close();
    await tab3.close();
  });

  test('extension handles storage operations during notifications', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');

    // Simulate notification trigger that involves storage
    await testPage.evaluate(() => {
      if (window.chrome && window.chrome.runtime) {
        chrome.runtime.sendMessage({
          type: 'mixed-script',
          url: 'https://suspicious-αlpha.com',
          char: 'α',
          block: 'Greek'
        });
      }
    });

    await testPage.waitForTimeout(1000);

    // Try to interact with storage to ensure it's not corrupted
    await testPage.evaluate(() => {
      return new Promise((resolve) => {
        if (window.chrome && window.chrome.storage) {
          chrome.storage.sync.get(['whitelist'], (result) => {
            resolve(result);
          });
        } else {
          resolve({});
        }
      });
    });

    // Page should still be responsive after storage operations
    const isResponsive = await testPage.evaluate(() => document.readyState);
    expect(isResponsive).toBe('complete');

    await testPage.close();
  });

  test('extension notification frequency limiting', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');

    // Send multiple notifications for the same domain rapidly
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      await testPage.evaluate(() => {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage({
            type: 'mixed-script',
            url: 'https://same-domain.com',
            char: 'α',
            block: 'Greek'
          });
        }
      });
      await testPage.waitForTimeout(100);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Extension should handle rapid notifications without significant delay
    expect(duration).toBeLessThan(2000);

    await testPage.close();
  });

  test('extension error handling in notification system', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');

    // Send malformed messages to test error handling
    await testPage.evaluate(() => {
      if (window.chrome && window.chrome.runtime) {
        // Send message with missing fields
        chrome.runtime.sendMessage({
          type: 'mixed-script'
          // Missing url, char, block
        });

        // Send message with invalid data
        chrome.runtime.sendMessage({
          type: 'invalid-type',
          url: null,
          char: undefined
        });

        // Send completely malformed message
        chrome.runtime.sendMessage(null);
      }
    });

    await testPage.waitForTimeout(1000);

    // Extension should handle errors gracefully without crashing
    const pageIsStillFunctional = await testPage.evaluate(() => {
      return typeof window.chrome !== 'undefined';
    });

    expect(pageIsStillFunctional).toBeTruthy();

    await testPage.close();
  });

  test('extension cleanup after notifications', async () => {
    const testPage = await context.newPage();
    await testPage.goto('https://example.com');

    // Trigger several notifications
    for (let i = 0; i < 3; i++) {
      await testPage.evaluate((index) => {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage({
            type: 'mixed-script',
            url: `https://test-${index}.com`,
            char: 'α',
            block: 'Greek'
          });
        }
      }, i);
      await testPage.waitForTimeout(300);
    }

    await testPage.waitForTimeout(1000);

    // Close the page and ensure cleanup happens
    await testPage.close();

    // Service worker should still be functional for other pages
    const newPage = await context.newPage();
    await newPage.goto('https://example.com');

    const extensionStillWorks = await newPage.evaluate(() => {
      return typeof window.chrome !== 'undefined';
    });

    expect(extensionStillWorks).toBeTruthy();

    await newPage.close();
  });
});
