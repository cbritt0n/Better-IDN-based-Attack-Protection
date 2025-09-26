/* popup.js
   Extension popup script for Better IDN Protection.
   Handles domain analysis, whitelist management, and threat detection display.
*/

// Production mode - debugging disabled
const DEBUG = false;
function debugLog(_message, ..._args) {
  if (DEBUG) {
    // Debug output suppressed in production
  }
}

// Initialize error handling
window.addEventListener('error', (event) => {
  debugLog('Error:', event.error);
});

// Display suspicious character and block if sent via message
let currentDomain = '';

function setStatus(text) {
  debugLog('Setting status:', text);
  try {
    const element = document.getElementById('suspicious');
    if (element) {
      element.textContent = text;

      // Update status card style based on content
      const statusCard = document.getElementById('warning-section');
      if (statusCard) {
        statusCard.className = 'status-card';
        if (text.toLowerCase().includes('safe') || text.toLowerCase().includes('no threats')) {
          statusCard.classList.add('safe');
        } else if (text.toLowerCase().includes('suspicious') || text.toLowerCase().includes('warning')) {
          statusCard.classList.add('danger');
        }
      }
    } else {
      debugLog('ERROR: suspicious element not found');
    }
  } catch (error) {
    debugLog('Error setting status:', error);
  }
}

function processAnalysisResult(result, domain) {
  debugLog('Processing analysis result:', result);

  if (result.safe) {
    let statusMessage = 'Domain analysis completed - appears safe.';
    if (result.reason === 'educational') {
      statusMessage = 'Educational domain - considered trusted.';
    } else if (result.reason === 'whitelisted') {
      statusMessage = 'Domain is whitelisted and considered safe.';
    } else if (result.reason === 'no-mixed-scripts') {
      statusMessage = 'No mixed script characters detected - appears safe.';
    }

    // Update popup to show safe result
    const statusCard = document.getElementById('warning-section');
    if (statusCard) {
      statusCard.className = 'status-card safe';

      // Update title for safe result
      const statusTitle = statusCard.querySelector('.status-title');
      if (statusTitle) {
        statusTitle.textContent = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M9 12L11 14L15 10');
        path1.setAttribute('stroke', 'currentColor');
        path1.setAttribute('stroke-width', '2');
        path1.setAttribute('stroke-linecap', 'round');
        path1.setAttribute('stroke-linejoin', 'round');

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z');
        path2.setAttribute('stroke', 'currentColor');
        path2.setAttribute('stroke-width', '2');
        path2.setAttribute('stroke-linecap', 'round');
        path2.setAttribute('stroke-linejoin', 'round');

        svg.appendChild(path1);
        svg.appendChild(path2);
        statusTitle.appendChild(svg);

        const textNode = document.createTextNode(' Analysis Complete');
        statusTitle.appendChild(textNode);
      }

      // Update description for safe result
      const statusDesc = statusCard.querySelector('.status-description');
      if (statusDesc) {
        statusDesc.textContent = 'No mixed script characters detected in domain name.';
      }
    }

    setStatus(statusMessage);
  } else {
    // Show threat result with actual encoded domain
    const threatDomain = result.domain || domain;
    const statusCard = document.getElementById('warning-section');
    if (statusCard) {
      statusCard.className = 'status-card danger';

      // Update title for threat result with warning icon
      const statusTitle = statusCard.querySelector('.status-title');
      if (statusTitle) {
        statusTitle.textContent = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z');
        path1.setAttribute('stroke', 'currentColor');
        path1.setAttribute('stroke-width', '2');
        path1.setAttribute('stroke-linecap', 'round');
        path1.setAttribute('stroke-linejoin', 'round');

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M12 9V13');
        path2.setAttribute('stroke', 'currentColor');
        path2.setAttribute('stroke-width', '2');
        path2.setAttribute('stroke-linecap', 'round');
        path2.setAttribute('stroke-linejoin', 'round');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '17');
        circle.setAttribute('r', '1');
        circle.setAttribute('fill', 'currentColor');

        svg.appendChild(path1);
        svg.appendChild(path2);
        svg.appendChild(circle);
        statusTitle.appendChild(svg);
        statusTitle.appendChild(document.createTextNode(' Security Alert'));
      }

      // Update description for threat result
      const statusDesc = statusCard.querySelector('.status-description');
      if (statusDesc) {
        statusDesc.textContent = 'A suspicious URL pattern was detected that may indicate an IDN-based phishing attack.';
      }
    }

    setStatus(`THREAT DETECTED: The URL "${threatDomain}" contains suspicious character '${result.char}' (Unicode block: ${result.block}) which may indicate an IDN-based phishing attack.`);
  }
}

// Message listener removed - extension popup now uses direct content script communication only
// This eliminates conflicts and duplicate messaging that caused status cycling

// Helper function to force fresh analysis by clearing cached results
function clearAnalysisCache(domain) {
  debugLog('Clearing analysis cache for domain:', domain);
  // Send message to content script to clear cached analysis for this domain
  chrome.runtime.sendMessage({ type: 'get-tab-for-analysis' }, (response) => {
    if (chrome.runtime.lastError || !response || !response.tabId) {
      return;
    }

    chrome.tabs.sendMessage(response.tabId, {
      type: 'clear-analysis-cache',
      url: domain.startsWith('http') ? domain : `https://${domain}`
    }, () => {
      // Ignore response, this is just a cache clear
    });
  });
}

function triggerDomainAnalysis(domain) {
  debugLog('Triggering domain analysis for:', domain);

  // Clear any cached results first to ensure fresh analysis
  clearAnalysisCache(domain);

  let analysisCompleted = false;

  // Set a timeout as fallback only if no analysis result received
  const analysisTimeout = setTimeout(() => {
    if (!analysisCompleted) {
      debugLog('Analysis timeout - no result received, showing fallback');
      setStatus('Analysis timeout - unable to determine threat status. Always verify URLs independently.');

      // Update the status card to show neutral state
      const statusCard = document.getElementById('warning-section');
      if (statusCard) {
        statusCard.className = 'status-card';

        // Update title
        const statusTitle = statusCard.querySelector('.status-title');
        if (statusTitle) {
          statusTitle.textContent = '⏱️ Analysis Timeout';
        }

        // Update description
        const statusDesc = statusCard.querySelector('.status-description');
        if (statusDesc) {
          statusDesc.textContent = 'Could not complete analysis within expected time.';
        }
      }
    }
  }, 2000); // 2 second timeout as genuine fallback

  try {
    // Ask background script for the correct tab to analyze
    chrome.runtime.sendMessage({ type: 'get-tab-for-analysis' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.tabId) {
        analysisCompleted = true;
        clearTimeout(analysisTimeout);
        setStatus('No web page available for analysis - open a website first.');
        return;
      }

      // Use the tab ID provided by background script
      const tabId = response.tabId;
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          analysisCompleted = true;
          clearTimeout(analysisTimeout);
          setStatus('Unable to access tab for analysis.');
          return;
        }

        processTabForAnalysis(tab, domain, () => {
          analysisCompleted = true;
          clearTimeout(analysisTimeout);
        });
      });
    });
  } catch (error) {
    analysisCompleted = true;
    clearTimeout(analysisTimeout);
    debugLog('Error in triggerDomainAnalysis:', error);
    setStatus('Analysis error - refresh page to try again.');
  }
}

function processTabForAnalysis(activeTab, domain, onComplete) {
  if (activeTab && activeTab.id) {
    // Send direct message to content script to get stored analysis
    chrome.tabs.sendMessage(activeTab.id, {
      type: 'analyze-url',
      url: domain.startsWith('http') ? domain : `https://${domain}`
    }, (response) => {
      onComplete();

      if (chrome.runtime.lastError) {
        debugLog('Content script not available:', chrome.runtime.lastError.message);
        // Wait a bit and retry - content script might still be loading
        setTimeout(() => {
          chrome.tabs.sendMessage(activeTab.id, {
            type: 'analyze-url',
            url: domain.startsWith('http') ? domain : `https://${domain}`
          }, (retryResponse) => {
            if (chrome.runtime.lastError || !retryResponse) {
              // Content script still not ready - ask user to refresh
              setStatus('Content script not loaded - please refresh the page to enable analysis.');
              const statusCard = document.getElementById('warning-section');
              if (statusCard) {
                statusCard.className = 'status-card';
              }
            } else if (retryResponse && retryResponse.result) {
              // Process the successful retry response
              const result = retryResponse.result;
              debugLog('Got retry analysis result:', result);
              processAnalysisResult(result, domain);
            }
          });
        }, 500); // Wait 500ms for content script to load
        return;
      }

      if (response && response.result) {
        const result = response.result;
        debugLog('Got analysis result:', result);
        processAnalysisResult(result, domain);
      } else {
        debugLog('No analysis result received');
        setStatus('No analysis result available - refresh page to re-analyze.');
      }
    });
  } else {
    onComplete();
    setStatus('Invalid tab - unable to analyze current page.');
  }
}

function setCurrentDomain(domain) {
  debugLog('Setting current domain:', domain);
  try {
    currentDomain = domain || '';
    const element = document.getElementById('domain');
    if (element) {
      // Display Unicode characters (like å) instead of punycode
      let displayDomain = currentDomain || 'No active domain';
      if (currentDomain && typeof punycode !== 'undefined') {
        try {
          // Convert to Unicode to show readable characters like å
          displayDomain = punycode.ToUnicode(currentDomain);
        } catch (e) {
          displayDomain = currentDomain; // fallback to original
        }
      }
      element.textContent = displayDomain;
      element.classList.remove('loading');
    } else {
      debugLog('ERROR: domain element not found');
    }
    updateWhitelistButtons();

    // Check if domain is whitelisted and handle accordingly
    if (currentDomain) {
      isDomainWhitelisted(currentDomain, (isWhitelisted) => {
        if (isWhitelisted) {
          // Domain is whitelisted - immediately show safe state without analysis
          debugLog('Domain is whitelisted, showing safe state immediately');
          const statusCard = document.getElementById('warning-section');
          if (statusCard) {
            statusCard.className = 'status-card safe';

            // Update to safe icon and text
            const statusTitle = statusCard.querySelector('.status-title');
            if (statusTitle) {
              statusTitle.textContent = '';
              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svg.setAttribute('class', 'icon');
              svg.setAttribute('viewBox', '0 0 24 24');
              svg.setAttribute('fill', 'none');

              const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path1.setAttribute('d', 'M9 12L11 14L15 10');
              path1.setAttribute('stroke', 'currentColor');
              path1.setAttribute('stroke-width', '2');
              path1.setAttribute('stroke-linecap', 'round');
              path1.setAttribute('stroke-linejoin', 'round');

              const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path2.setAttribute('d', 'M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z');
              path2.setAttribute('stroke', 'currentColor');
              path2.setAttribute('stroke-width', '2');
              path2.setAttribute('stroke-linecap', 'round');
              path2.setAttribute('stroke-linejoin', 'round');

              svg.appendChild(path1);
              svg.appendChild(path2);
              statusTitle.appendChild(svg);
              statusTitle.appendChild(document.createTextNode(' Domain Trusted'));
            }

            const statusDesc = statusCard.querySelector('.status-description');
            if (statusDesc) {
              statusDesc.textContent = 'This domain is on your whitelist and considered safe.';
            }
          }

          setStatus('Domain is whitelisted and considered safe.');
        } else {
          // Domain is not whitelisted - proceed with normal analysis
          triggerDomainAnalysis(currentDomain);
        }
      });
    }
  } catch (error) {
    debugLog('Error setting current domain:', error);
  }
}

function _toggleWarning(show) {
  debugLog('Toggling warning display:', show);
  try {
    const statusCard = document.getElementById('warning-section');
    if (statusCard) {
      if (show) {
        statusCard.style.display = 'block';
        statusCard.className = 'status-card danger';
      } else {
        statusCard.className = 'status-card safe';
        // Update content for safe state
        const statusTitle = statusCard.querySelector('.status-title');
        const statusDesc = statusCard.querySelector('.status-description');
        const suspicious = document.getElementById('suspicious');

        if (statusTitle) {
          // Create safe DOM elements instead of innerHTML
          statusTitle.textContent = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('class', 'icon');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');

          const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path1.setAttribute('d', 'M9 12L11 14L15 10');
          path1.setAttribute('stroke', 'currentColor');
          path1.setAttribute('stroke-width', '2');
          path1.setAttribute('stroke-linecap', 'round');
          path1.setAttribute('stroke-linejoin', 'round');

          const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path2.setAttribute('d', 'M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z');
          path2.setAttribute('stroke', 'currentColor');
          path2.setAttribute('stroke-width', '2');
          path2.setAttribute('stroke-linecap', 'round');
          path2.setAttribute('stroke-linejoin', 'round');

          svg.appendChild(path1);
          svg.appendChild(path2);
          statusTitle.appendChild(svg);

          const textNode = document.createTextNode(' Domain Trusted');
          statusTitle.appendChild(textNode);
        }
        if (statusDesc) {
          statusDesc.textContent = 'This domain is on your whitelist and considered safe.';
        }
        if (suspicious) {
          suspicious.textContent = 'No threats detected - domain is whitelisted';
        }
      }
    }
  } catch (e) {
    debugLog('Error toggling warning:', e);
  }
}

function isDomainWhitelisted(domain, cb) {
  debugLog('Checking if domain is whitelisted:', domain);
  if (!domain) return cb(false);
  try {
    const ascii = (typeof punycode !== 'undefined') ? punycode.ToASCII(domain) : domain;
    chrome.storage.sync.get(['whitelist'], (res) => {
      if (chrome.runtime.lastError) {
        debugLog('Error accessing whitelist:', chrome.runtime.lastError.message);
        cb(false);
        return;
      }
      const wl = (res && res.whitelist) || [];
      const found = wl.includes(ascii) || wl.includes(domain) || wl.includes((typeof punycode !== 'undefined') ? punycode.ToUnicode(domain) : domain);
      debugLog('Domain whitelisted:', found);
      cb(!!found);
    });
  } catch (e) {
    debugLog('Error checking whitelist:', e.message);
    cb(false);
  }
}

function updateWhitelistButtons() {
  debugLog('Updating whitelist buttons for domain:', currentDomain);
  try {
    chrome.storage.sync.get(['whitelist'], (res) => {
      if (chrome.runtime.lastError) {
        debugLog('Error accessing whitelist for buttons:', chrome.runtime.lastError.message);
        return;
      }
      const wl = (res && res.whitelist) || [];
      const addBtn = document.getElementById('add-wl');
      const removeBtn = document.getElementById('remove-wl');

      if (!currentDomain) {
        if (addBtn) addBtn.disabled = true;
        if (removeBtn) removeBtn.disabled = true;
        return;
      }

      const asciiForm = (typeof punycode !== 'undefined') ? punycode.ToASCII(currentDomain) : currentDomain;
      const isDomainWhitelisted = wl.includes(asciiForm) || wl.includes(currentDomain) ||
        wl.includes((typeof punycode !== 'undefined') ? punycode.ToUnicode(currentDomain) : currentDomain);

      debugLog('Whitelist check - Domain:', currentDomain, 'ASCII:', asciiForm, 'Whitelisted:', isDomainWhitelisted, 'Whitelist:', wl);

      if (isDomainWhitelisted) {
        debugLog('Domain is whitelisted - showing Remove button, hiding Add button');
        if (addBtn) {
          addBtn.disabled = true;
          addBtn.style.display = 'none';
        }
        if (removeBtn) {
          removeBtn.disabled = false;
          removeBtn.style.display = 'inline-flex';
        }
      } else {
        debugLog('Domain is NOT whitelisted - showing Add button, hiding Remove button');
        if (addBtn) {
          addBtn.disabled = false;
          addBtn.style.display = 'inline-flex';
        }
        if (removeBtn) {
          removeBtn.disabled = true;
          removeBtn.style.display = 'none';
        }
      }
    });
  } catch (e) {
    debugLog('Error updating whitelist buttons:', e);
  }
}

function addToWhitelist() {
  debugLog('Adding to whitelist:', currentDomain);
  if (!currentDomain) return;
  const toStore = (typeof punycode !== 'undefined') ? punycode.ToASCII(currentDomain) : currentDomain;
  chrome.storage.sync.get(['whitelist'], (res) => {
    const wl = (res && res.whitelist) || [];
    const wasAlreadyListed = wl.includes(toStore);
    if (!wasAlreadyListed) {
      wl.push(toStore);
      debugLog(`Adding domain to whitelist: ${toStore} (was already listed: ${wasAlreadyListed})`);
    }
    chrome.storage.sync.set({ whitelist: wl }, () => {
      debugLog('Domain added to whitelist, updating UI to safe state');
      updateWhitelistButtons();
      renderWhitelist();

      // Immediately show safe colors and content for whitelisted domain
      if (currentDomain) {
        const statusCard = document.getElementById('warning-section');
        if (statusCard) {
          statusCard.className = 'status-card safe';

          // Update to safe icon and text
          const statusTitle = statusCard.querySelector('.status-title');
          if (statusTitle) {
            statusTitle.textContent = '';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'icon');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');

            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M9 12L11 14L15 10');
            path1.setAttribute('stroke', 'currentColor');
            path1.setAttribute('stroke-width', '2');
            path1.setAttribute('stroke-linecap', 'round');
            path1.setAttribute('stroke-linejoin', 'round');

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z');
            path2.setAttribute('stroke', 'currentColor');
            path2.setAttribute('stroke-width', '2');
            path2.setAttribute('stroke-linecap', 'round');
            path2.setAttribute('stroke-linejoin', 'round');

            svg.appendChild(path1);
            svg.appendChild(path2);
            statusTitle.appendChild(svg);
            statusTitle.appendChild(document.createTextNode(' Domain Trusted'));
          }

          const statusDesc = statusCard.querySelector('.status-description');
          if (statusDesc) {
            statusDesc.textContent = 'This domain is on your whitelist and considered safe.';
          }
        }

        setStatus('Domain added to whitelist and marked as safe.');
      }
    });
  });
}

function removeFromWhitelist() {
  debugLog('Removing from whitelist:', currentDomain);
  if (!currentDomain) return;
  const asciiForm = (typeof punycode !== 'undefined') ? punycode.ToASCII(currentDomain) : currentDomain;
  chrome.storage.sync.get(['whitelist'], (res) => {
    let wl = (res && res.whitelist) || [];
    const beforeLength = wl.length;
    wl = wl.filter((d) => d !== asciiForm && d !== currentDomain && d !== ((typeof punycode !== 'undefined') ? punycode.ToUnicode(currentDomain) : currentDomain));
    const afterLength = wl.length;

    debugLog(`Whitelist filter: before=${beforeLength}, after=${afterLength}, removed=${beforeLength - afterLength} entries`);

    chrome.storage.sync.set({ whitelist: wl }, () => {
      debugLog('Domain removed from whitelist, updating UI and re-analyzing');
      updateWhitelistButtons();
      renderWhitelist();

      // Re-analyze the domain to check if it's actually vulnerable
      // This will show the red threat colors if the domain has mixed scripts
      if (currentDomain) {
        triggerDomainAnalysis(currentDomain);
      }
    });
  });
}

function renderWhitelist() {
  debugLog('Rendering whitelist');
  chrome.storage.sync.get(['whitelist'], (res) => {
    const wl = (res && res.whitelist) || [];
    const listContainer = document.getElementById('whitelist-list');
    if (!listContainer) {
      debugLog('ERROR: whitelist-list element not found');
      return;
    }

    if (wl.length === 0) {
      // Create empty state with safe DOM manipulation
      listContainer.textContent = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'icon');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');

      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7Z');
      path1.setAttribute('stroke', 'currentColor');
      path1.setAttribute('stroke-width', '2');

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', 'M8 12H16');
      path2.setAttribute('stroke', 'currentColor');
      path2.setAttribute('stroke-width', '2');
      path2.setAttribute('stroke-linecap', 'round');

      svg.appendChild(path1);
      svg.appendChild(path2);

      const p = document.createElement('p');
      p.textContent = 'No domains in whitelist';

      emptyDiv.appendChild(svg);
      emptyDiv.appendChild(p);
      listContainer.appendChild(emptyDiv);
    } else {
      // Create whitelist items with safe DOM manipulation
      listContainer.textContent = '';
      wl.forEach(d => {
        // Show Unicode characters (like å) for better readability
        let display = d;
        if (typeof punycode !== 'undefined') {
          try {
            display = punycode.ToUnicode(d);
          } catch (e) {
            display = d; // fallback to original
          }
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'whitelist-item';

        const domainInfoDiv = document.createElement('div');
        domainInfoDiv.className = 'domain-info';

        // Create check icon SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'icon');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12S7.03 3 12 3S21 7.03 21 12Z');
        path1.setAttribute('stroke', 'currentColor');
        path1.setAttribute('stroke-width', '2');
        path1.setAttribute('stroke-linecap', 'round');
        path1.setAttribute('stroke-linejoin', 'round');

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M9 12L11 14L15 10');
        path2.setAttribute('stroke', 'currentColor');
        path2.setAttribute('stroke-width', '2');
        path2.setAttribute('stroke-linecap', 'round');
        path2.setAttribute('stroke-linejoin', 'round');

        svg.appendChild(path1);
        svg.appendChild(path2);

        const domainSpan = document.createElement('span');
        domainSpan.className = 'domain-name';
        domainSpan.textContent = display;

        domainInfoDiv.appendChild(svg);
        domainInfoDiv.appendChild(domainSpan);

        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.setAttribute('data-domain', d);
        removeBtn.setAttribute('title', 'Remove from whitelist');

        // Create remove icon SVG
        const removeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        removeSvg.setAttribute('class', 'icon');
        removeSvg.setAttribute('viewBox', '0 0 24 24');
        removeSvg.setAttribute('fill', 'none');

        const removePath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        removePath1.setAttribute('d', 'M18 6L6 18');
        removePath1.setAttribute('stroke', 'currentColor');
        removePath1.setAttribute('stroke-width', '2');
        removePath1.setAttribute('stroke-linecap', 'round');
        removePath1.setAttribute('stroke-linejoin', 'round');

        const removePath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        removePath2.setAttribute('d', 'M6 6L18 18');
        removePath2.setAttribute('stroke', 'currentColor');
        removePath2.setAttribute('stroke-width', '2');
        removePath2.setAttribute('stroke-linecap', 'round');
        removePath2.setAttribute('stroke-linejoin', 'round');

        removeSvg.appendChild(removePath1);
        removeSvg.appendChild(removePath2);
        removeBtn.appendChild(removeSvg);

        itemDiv.appendChild(domainInfoDiv);
        itemDiv.appendChild(removeBtn);
        listContainer.appendChild(itemDiv);
      });

      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const domain = e.target.closest('.remove-btn').dataset.domain;
          if (domain) {
            debugLog('Removing domain from whitelist via X button:', domain);
            chrome.storage.sync.get(['whitelist'], (res2) => {
              let wl2 = (res2 && res2.whitelist) || [];
              const beforeLength = wl2.length;
              wl2 = wl2.filter(x => x !== domain);
              const afterLength = wl2.length;

              debugLog(`Whitelist X-button removal: before=${beforeLength}, after=${afterLength}, removed=${beforeLength - afterLength} entries`);

              chrome.storage.sync.set({ whitelist: wl2 }, () => {
                debugLog('Domain removed via X button, updating all UI');
                renderWhitelist();
                updateWhitelistButtons();
                // Also update warning state if this was the current domain
                if (currentDomain &&
                    (domain === currentDomain ||
                     domain === ((typeof punycode !== 'undefined') ? punycode.ToASCII(currentDomain) : currentDomain) ||
                     domain === ((typeof punycode !== 'undefined') ? punycode.ToUnicode(currentDomain) : currentDomain))) {
                  // Re-analyze to show proper threat colors if domain is vulnerable
                  triggerDomainAnalysis(currentDomain);
                }
              });
            });
          }
        });
      });
    }
  });
}

function initializePopupContent() {
  debugLog('Initializing popup content');

  // Migrate existing whitelist entries to canonical ASCII (punycode) form
  try {
    chrome.storage.sync.get(['whitelist'], (res) => {
      const wl = (res && res.whitelist) || [];
      if (!wl || wl.length === 0) {
        updateWhitelistButtons();
        renderWhitelist();
        getCurrentTabDomain();
        return;
      }
      const migrated = [];
      for (const d of wl) {
        try {
          const unicode = (typeof punycode !== 'undefined') ? punycode.ToUnicode(d) : d;
          const ascii = (typeof punycode !== 'undefined') ? punycode.ToASCII(unicode) : unicode;
          if (!migrated.includes(ascii)) migrated.push(ascii);
        } catch (e) {
          if (!migrated.includes(d)) migrated.push(d);
        }
      }
      const changed = migrated.length !== wl.length || migrated.some((v, i) => v !== wl[i]);
      if (changed) {
        chrome.storage.sync.set({ whitelist: migrated }, () => {
          updateWhitelistButtons();
          renderWhitelist();
          getCurrentTabDomain();
        });
      } else {
        updateWhitelistButtons();
        renderWhitelist();
        getCurrentTabDomain();
      }
    });
  } catch (e) {
    debugLog('Error during whitelist migration:', e);
    updateWhitelistButtons();
    renderWhitelist();
    getCurrentTabDomain();
  }
}

function getCurrentTabDomain() {
  debugLog('Getting current tab domain');

  // Populate currentDomain from background (preferred) or from active tab
  try {
    const params = new URLSearchParams(window.location.search);
    const domainParam = params.get('domain');
    if (domainParam) {
      try {
        const u = new URL(domainParam.startsWith('http') ? domainParam : `https://${domainParam}`);
        setCurrentDomain(u.hostname);
        return;
      } catch (e) {
        // if domainParam isn't a URL, treat it as hostname
        setCurrentDomain(domainParam);
        return;
      }
    }
  } catch (e) {
    debugLog('Error parsing URL params:', e);
  }

  // Ask background script for the last active non-extension tab
  try {
    chrome.runtime.sendMessage({ type: 'get-active-tab' }, (res) => {
      if (chrome.runtime.lastError) {
        debugLog('Error getting active tab from background:', chrome.runtime.lastError.message);
        // Fallback: try to get the most recent non-extension tab directly
        fallbackToTabQuery();
      } else if (res && res.url) {
        try {
          const u = new URL(res.url);
          // Use the URL from background script (it tracks non-extension tabs)
          setCurrentDomain(u.hostname);
        } catch (e) {
          debugLog('Error parsing response URL:', e.message);
          fallbackToTabQuery();
        }
      } else {
        debugLog('No URL received from background script');
        fallbackToTabQuery();
      }
    });
  } catch (e) {
    debugLog('Error sending message to background:', e);
    fallbackToTabQuery();
  }
}

function fallbackToTabQuery() {
  debugLog('Falling back to direct tab query');
  try {
    if (chrome.tabs && chrome.tabs.query) {
      // Query all tabs and find the most recent non-extension HTTP/HTTPS tab
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) {
          debugLog('Error querying all tabs:', chrome.runtime.lastError.message);
          setCurrentDomain('Unable to detect domain');
          return;
        }

        if (tabs && tabs.length) {
          // Filter for web pages (HTTP/HTTPS) and sort by last accessed
          const webTabs = tabs.filter(t =>
            t && t.url &&
            (t.url.startsWith('http://') || t.url.startsWith('https://')) &&
            !t.url.startsWith('chrome-extension:') &&
            !t.url.startsWith('moz-extension:')
          ).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));

          if (webTabs.length > 0) {
            try {
              const u = new URL(webTabs[0].url);
              setCurrentDomain(u.hostname);
            } catch (e) {
              debugLog('Error parsing fallback URL:', e.message);
              setCurrentDomain('Invalid URL format');
            }
          } else {
            debugLog('No web tabs found');
            setCurrentDomain('No web pages open');
          }
        } else {
          debugLog('No tabs found');
          setCurrentDomain('No tabs available');
        }
      });
    } else {
      debugLog('Tabs API not available');
      setCurrentDomain('Tabs API unavailable');
    }
  } catch (e) {
    debugLog('Error in fallback tab query:', e.message);
    setCurrentDomain('Tab query failed');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM Content Loaded, initializing popup');
  try {
    // Check if all required elements exist
    const requiredElements = ['add-wl', 'remove-wl', 'clear-wl', 'suspicious', 'domain', 'whitelist-list'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));

    if (missingElements.length > 0) {
      debugLog('ERROR: Missing elements:', missingElements);
    } else {
      debugLog('All required elements found');
    }

    const addBtn = document.getElementById('add-wl');
    const removeBtn = document.getElementById('remove-wl');
    const clearBtn = document.getElementById('clear-wl');

    if (addBtn) {
      addBtn.addEventListener('click', addToWhitelist);
      debugLog('Add button listener attached');
    }
    if (removeBtn) {
      removeBtn.addEventListener('click', removeFromWhitelist);
      debugLog('Remove button listener attached');
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        debugLog('Clearing whitelist');
        chrome.storage.sync.set({ whitelist: [] }, () => {
          debugLog('Whitelist cleared, updating UI and re-analyzing current domain');
          renderWhitelist();
          updateWhitelistButtons();

          // Re-analyze the current domain to show proper threat colors if it's vulnerable
          // This ensures the domain shows red if it has mixed scripts after being removed from whitelist
          if (currentDomain) {
            triggerDomainAnalysis(currentDomain);
          }
        });
      });
      debugLog('Clear button listener attached');
    }

    // Clear initial "Analyzing current page..." status immediately
    setStatus('Initializing analysis...');

    // Initialize popup content
    initializePopupContent();
  } catch (error) {
    debugLog('Error during DOMContentLoaded:', error);
  }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  debugLog('DOM still loading, waiting for DOMContentLoaded');
} else {
  debugLog('DOM already loaded, initializing immediately');
  // Trigger the same initialization
  document.dispatchEvent(new Event('DOMContentLoaded'));
}
