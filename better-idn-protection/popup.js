/* popup.js
   Externalized popup script to comply with MV3 CSP (no inline scripts).
*/
// Display suspicious character and block if sent via message
let currentDomain = '';
function setStatus(text) {
  document.getElementById('suspicious').textContent = text;
}

chrome.runtime.onMessage.addListener((msg) => {
  // Support direct 'popup-alert' messages from background when the popup is opened
  if (msg && msg.type === 'popup-alert') {
    if (msg.url) {
      try {
        const u = new URL(msg.url);
        setCurrentDomain(u.hostname);
      } catch (e) {
        setCurrentDomain(msg.url);
      }
    }
    setStatus(`Suspicious character: ${msg.char} (Unicode block: ${msg.block})`);
    return;
  }
  if (msg && msg.char && msg.block) {
    const url = msg.url || '';
    const hostname = (function () {
      try { return new URL(url).hostname; } catch (e) { return ''; }
    })();
    if (hostname) setCurrentDomain(hostname);
    setStatus(`Suspicious character: ${msg.char} (Unicode block: ${msg.block})`);
  }
});

function setCurrentDomain(domain) {
  currentDomain = domain || '';
  document.getElementById('domain').textContent = currentDomain;
  updateWhitelistButtons();
  // if whitelisted, hide the warning UI
  isDomainWhitelisted(currentDomain, (isWL) => {
    toggleWarning(!isWL);
  });
}

function toggleWarning(show) {
  try {
    const h2 = document.querySelector('#status h2');
    const h4 = document.querySelector('#status h4');
    const suspicious = document.getElementById('suspicious');
    if (h2) h2.style.display = show ? '' : 'none';
    if (h4) h4.style.display = show ? '' : 'none';
    if (suspicious) suspicious.style.display = show ? '' : 'none';
  } catch (e) {
    // ignore
  }
}

function isDomainWhitelisted(domain, cb) {
  if (!domain) return cb(false);
  try {
    const ascii = (typeof punycode !== 'undefined') ? punycode.ToASCII(domain) : domain;
    chrome.storage.sync.get(['whitelist'], (res) => {
      const wl = (res && res.whitelist) || [];
      const found = wl.includes(ascii) || wl.includes(domain) || wl.includes((typeof punycode !== 'undefined') ? punycode.ToUnicode(domain) : domain);
      cb(!!found);
    });
  } catch (e) {
    cb(false);
  }
}

function updateWhitelistButtons() {
  chrome.storage.sync.get(['whitelist'], (res) => {
    const wl = (res && res.whitelist) || [];
    const addBtn = document.getElementById('add-wl');
    const removeBtn = document.getElementById('remove-wl');
    if (!currentDomain) { addBtn.disabled = true; removeBtn.disabled = true; return; }
    const asciiForm = (typeof punycode !== 'undefined') ? punycode.ToASCII(currentDomain) : currentDomain;
    if (wl.includes(asciiForm) || wl.includes(currentDomain) || wl.includes((typeof punycode !== 'undefined') ? punycode.ToUnicode(currentDomain) : currentDomain)) {
      addBtn.disabled = true;
      removeBtn.disabled = false;
    } else {
      addBtn.disabled = false;
      removeBtn.disabled = true;
    }
  });
}

function addToWhitelist() {
  if (!currentDomain) return;
  const toStore = (typeof punycode !== 'undefined') ? punycode.ToASCII(currentDomain) : currentDomain;
  chrome.storage.sync.get(['whitelist'], (res) => {
    const wl = (res && res.whitelist) || [];
    if (!wl.includes(toStore)) wl.push(toStore);
    chrome.storage.sync.set({ whitelist: wl }, () => updateWhitelistButtons());
  });
}

function removeFromWhitelist() {
  if (!currentDomain) return;
  const asciiForm = (typeof punycode !== 'undefined') ? punycode.ToASCII(currentDomain) : currentDomain;
  chrome.storage.sync.get(['whitelist'], (res) => {
    let wl = (res && res.whitelist) || [];
    wl = wl.filter((d) => d !== asciiForm && d !== currentDomain && d !== ((typeof punycode !== 'undefined') ? punycode.ToUnicode(currentDomain) : currentDomain));
    chrome.storage.sync.set({ whitelist: wl }, () => updateWhitelistButtons());
  });
}

function renderWhitelist() {
  chrome.storage.sync.get(['whitelist'], (res) => {
    const wl = (res && res.whitelist) || [];
    const ul = document.getElementById('whitelist-list');
    ul.innerHTML = '';
    if (wl.length === 0) {
      const li = document.createElement('li');
      li.textContent = '(none)';
      ul.appendChild(li);
      return;
    }
    wl.forEach((d) => {
      const li = document.createElement('li');
      const txt = document.createElement('span');
      const display = (typeof punycode !== 'undefined') ? punycode.ToUnicode(d) : d;
      txt.textContent = display;
      const btn = document.createElement('button');
      btn.textContent = 'Remove';
      btn.style.marginLeft = '8px';
      btn.addEventListener('click', () => {
        chrome.storage.sync.get(['whitelist'], (res2) => {
          let wl2 = (res2 && res2.whitelist) || [];
          wl2 = wl2.filter(x => x !== d);
          chrome.storage.sync.set({ whitelist: wl2 }, () => renderWhitelist());
        });
      });
      li.appendChild(txt);
      li.appendChild(btn);
      ul.appendChild(li);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-wl').addEventListener('click', addToWhitelist);
  document.getElementById('remove-wl').addEventListener('click', removeFromWhitelist);
  document.getElementById('clear-wl').addEventListener('click', () => {
    chrome.storage.sync.set({ whitelist: [] }, () => renderWhitelist());
  });
  // Migrate existing whitelist entries to canonical ASCII (punycode) form
  try {
    chrome.storage.sync.get(['whitelist'], (res) => {
      const wl = (res && res.whitelist) || [];
      if (!wl || wl.length === 0) {
        updateWhitelistButtons();
        renderWhitelist();
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
        });
      } else {
        updateWhitelistButtons();
        renderWhitelist();
      }
    });
  } catch (e) {
    updateWhitelistButtons();
    renderWhitelist();
  }
  // Populate currentDomain from background (preferred) or from active tab
  (function populateFromActiveTab() {
    // Prefer domain passed in query string when the popup is opened by the background
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
      // ignore
    }
    try {
      chrome.runtime.sendMessage('get-active-tab', (res) => {
        if (res && res.url) {
          try {
            const u = new URL(res.url);
            // ignore extension pages
            if (u.protocol && u.protocol.startsWith('chrome-extension')) {
              // fallthrough to tab query below
            } else {
              setCurrentDomain(u.hostname);
              return;
            }
          } catch (e) {
            // fallthrough
          }
        }
        try {
          chrome.tabs && chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length) {
              const candidate = tabs.find(t => t && t.url && /^https?:\/\//.test(t.url));
              if (candidate && candidate.url) {
                try {
                  const u = new URL(candidate.url);
                  setCurrentDomain(u.hostname);
                  return;
                } catch (e) {
                  // ignore
                }
              }
            }
          });
        } catch (e) {
          // ignore
        }
      });
    } catch (e) {
      // not available in some contexts
    }
  })();
});
