// ChromaPeek Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ ChromePeek installed");
});

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tabs.length) {
    throw new Error("No active tab found.");
  }

  return tabs[0];
}

async function sendToContent(message) {
  const tab = await getActiveTab();

  return chrome.tabs.sendMessage(tab.id, message);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request?.type === "DOWNLOAD_IMAGE" && request.imageUrl) {
        await chrome.downloads.download({
          url: request.imageUrl,
          filename: `chromapeek-${Date.now()}.${request.format || "png"}`,
        });

        sendResponse({ success: true });
        return;
      }

      sendResponse({
        success: false,
        error: `Unknown request type: ${request?.type}`,
      });
    } catch (error) {
      console.error(error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  })();

  return true;
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== "complete") return;

  await chrome.storage.local.remove(["pageData"]);

  try {
    await chrome.scripting.executeScript({
      target: {
        tabId
      },
      files: ["content.js"]
    });
  } catch (_) {
    // Ignore restricted pages like chrome:// or the Web Store.
  }
});