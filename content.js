console.log("Content script is running");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'URLChanged') {
    console.log('Content script received scrapeContent message.');
    var content = document.documentElement.outerHTML;
    sendResponse(content);
    console.log('Content script sends scraped data to background');
  } else if (request.action === 'email') {
    const legacyThreadId = document.querySelector('[data-legacy-thread-id]');
    const result = legacyThreadId ? legacyThreadId.getAttribute('data-legacy-thread-id') : 'Not found';
    const url1 = "https://mail.google.com/mail/u/0?view=att&th="
    const url2 = "&attid=0&disp=comp&safe=1&zw"
    let url = url1.concat(result + url2);
    sendResponse(url); // Send the response immediately
    console.log("Download URL message sent to background")
  }
});