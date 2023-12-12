chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scrapedData') {
    // Process or store the scraped data as needed
    console.log('Scraped data received:', message.content);
  }
});
