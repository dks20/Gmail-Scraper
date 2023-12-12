
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'scrapeContent') {
    var content = document.documentElement.outerHTML;
    chrome.runtime.sendMessage({ action: 'scrapeContent', content: content });
  }
});
