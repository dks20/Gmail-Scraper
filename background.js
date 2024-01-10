console.log('Background script is running.');

let scrapedData = null;
let url = null;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAndPerformAction') {
    console.log('Background script sent response for checkAndPerformAction to popup');
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (typeof tabs !== 'undefined' && Array.isArray(tabs) && tabs.length > 0) {
        if (tabs[0].url) {
          console.log('Initial tab URL:', tabs[0].url);
          handleUrlChange(tabs[0].url, tabs[0].id); // Pass tabId as the second argument
        } else {
          console.log("no url")
        }
     } else {
        console.log("No tabs found")
     }
    //  sendResponse({ message: 'Received checkAndPerformAction' });
    });
    sendResponse({ message: 'Received checkAndPerformAction' });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log("This one is working from background");
    handleUrlChange(tab.url, tabId); // Pass tabId as the second argument
  }
});

function handleUrlChange(url, tabId) {
  if (isGmailInbox(url)) {
    console.log(isGmailInbox(url));
    console.log('Handling URL change:', url);

    chrome.tabs.sendMessage(tabId, { action: 'URLChanged', urltype: 'allMails' }, function (response) {
      console.log('Received Scraped Data as response from content script:', response);
      scrapedData = response;
      console.log(">>>>>>>>>>>",scrapedData);
      chrome.runtime.sendMessage({ action: 'scrapedData', content: scrapedData });
      console.log('Sent message to popup for scraped data');
    });
    console.log('This is all mails page ');
    
  } else if (isGmailEmail(url)) {
    console.log(isGmailEmail(url));
    chrome.tabs.sendMessage(tabId, { action: 'email', urltype: 'mail' }, function (response) {
      console.log('Received URL as response from content script:', response);
      url = response;
      chrome.runtime.sendMessage({ action: 'scrapedURL', content: url });
      console.log('Sent message to popup for email scraped URL');
    });

    console.log('This is a particular email page.');
  }else{
    console.log("Not GMAIL Page");
  }
}

function isGmailInbox(url) {
  const gmailInboxRegex = /^https:\/\/mail\.google\.com\/mail\/u\/\d+\/#(inbox|starred|snoozed|sent|drafts|important|scheduled|all|spam|trash)\/[a-zA-Z0-9]+$/;
  return !gmailInboxRegex.test(url);
}

function isGmailEmail(url) {
  const gmailEmailRegex = /^https:\/\/mail\.google\.com\/mail\/u\/\d+\/#(inbox|starred|snoozed|sent|drafts|important|scheduled|all|spam|trash)\/[a-zA-Z0-9]+\/?$/;
  return gmailEmailRegex.test(url);
}