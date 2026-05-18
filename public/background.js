// Background service worker for ChromaPeek
let activeTabId = null;

// Log extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('ChromaPeek extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  activeTabId = tab.id;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleInspection
  });
});

// Toggle inspection mode
function toggleInspection() {
  if (window.chromaPeekActive) {
    window.chromaPeekActive = false;
    // Remove inspection overlay
    const overlay = document.getElementById('chromapeek-overlay');
    if (overlay) {
      overlay.remove();
    }
  } else {
    window.chromaPeekActive = true;
    // Initialize inspection
    if (typeof window.initializeChromaPeek === 'function') {
      window.initializeChromaPeek();
    }
  }
}

// Handle messages between popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    // Forward message to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, request, sendResponse);
    });
    return true; // Keep message channel open for async response
  }

  switch (request.type) {
    case 'GET_PAGE_DATA':
      // Forward message to content script
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, request)
          .then(response => sendResponse(response))
          .catch(() => sendResponse({ error: 'No response from content script' }));
        return true; // Keep channel open for async response
      }
      break;
      
    case 'UPDATE_CSS':
      // Forward CSS updates to content script
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, request)
          .then(response => sendResponse(response))
          .catch(() => sendResponse({ error: 'Failed to update CSS' }));
        return true;
      }
      break;
      
    case 'EXTRACT_COLORS':
      // Forward color extraction request
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, request)
          .then(response => sendResponse(response))
          .catch(() => sendResponse({ error: 'Failed to extract colors' }));
        return true;
      }
      break;
      
    case 'DOWNLOAD_IMAGE':
      // Handle image download
      if (request.imageUrl) {
        chrome.downloads.download({
          url: request.imageUrl,
          filename: `chromapeek-image-${Date.now()}.${request.format || 'png'}`
        });
      }
      break;
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Clear stored data when page changes
    chrome.storage.local.remove(['extractedData']);
    
    if (tabId === activeTabId) {
      // Re-inject content script if needed
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
    }
  }
});