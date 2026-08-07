// Background service worker for ChromaPeek

// Log extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('ChromaPeek extension installed');
});

// Resolve the tab the popup/user is currently looking at.
function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        resolve(tabs[0]);
      } else {
        reject(new Error('No active tab found'));
      }
    });
  });
}

// Forward a message to the content script running in the active tab.
function forwardToActiveTab(request, sendResponse, errorMessage) {
  getActiveTab()
    .then((tab) => chrome.tabs.sendMessage(tab.id, request))
    .then((response) => sendResponse(response))
    .catch(() => sendResponse({ error: errorMessage }));
}

// Handle messages between popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    forwardToActiveTab(request, sendResponse, 'No response from content script');
    return true; // Keep message channel open for async response
  }

  switch (request.type) {
    case 'GET_PAGE_DATA':
      forwardToActiveTab(
        request,
        sendResponse,
        'Could not reach the page. Try reloading it and scanning again.'
      );
      return true; // Keep channel open for async response

    case 'UPDATE_CSS':
      forwardToActiveTab(request, sendResponse, 'Failed to update CSS');
      return true;

    case 'EXTRACT_COLORS':
      forwardToActiveTab(request, sendResponse, 'Failed to extract colors');
      return true;

    case 'DOWNLOAD_IMAGE':
      // Handle image download
      if (request.imageUrl) {
        chrome.downloads.download({
          url: request.imageUrl,
          filename: `chromapeek-image-${Date.now()}.${request.format || 'png'}`,
        });
      }
      break;
  }

  return false;
});

// Clear any stale cached data when a tab finishes loading a new page.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.remove(['extractedData']);
  }
});