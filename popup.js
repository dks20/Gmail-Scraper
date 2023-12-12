document.addEventListener('DOMContentLoaded', function () {
  // Directly trigger content scraping when the extension is clicked
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrapeContent' });
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'scrapeContent') {
      var scrapedData = request.content;

      // Optionally, log or process the scraped data as needed
      console.log('Scraped data:', scrapedData);

      // Update the content of the HTML element
      document.getElementById("printOutput").innerHTML = extractEmailsAndSnameFromJson(scrapedData);
    }
});

function extractEmailsAndSnameFromJson(jsonData) {
    var dataarray = jsonData.split("<tr class");
    var vcount = 0;
    var Record = 1;
  
    var output = '<table border="1" style="width:100%; table-layout: fixed;">';
    output += '<tr><th style="width:6%;">Record No</th><th style="width:36%;">Sender Email</th><th style="width:15%;">Sender Name</th><th style="width:28%;">Subject</th><th style="width:15%;">Time</th></tr>';
  
    dataarray.forEach(function (emailElement) {
      if (vcount == 0) {
        
        var index01 = emailElement.indexOf('Inbox');
        var index01 = emailElement.indexOf('-',index01);
        var index02 = emailElement.indexOf('Gmail', index01);
        var user_email = emailElement.substring(index01 + 2, index02 - 3);

        var timestamp = new Date().toLocaleString();
        document.getElementById('userEmail').innerHTML = `<strong>User ID: ${user_email} - Time of data extraction: ${timestamp}</strong>`;
        vcount++;
      }else if(vcount <= 2) {
        vcount = vcount + 1;
        return;
      } else {
        var index01 = emailElement.indexOf('email=');
        var index02 = emailElement.indexOf('name', index01);
        var senderEmail = emailElement.substring(index01 + 7, index02 - 3);
        index01 = index02;
        index02 = emailElement.indexOf('\"', index01 + 8);
        var senderName = emailElement.substring(index01 + 6, index02 - 1);
        index01 = emailElement.indexOf('data-legacy-thread-id', index02);
        index01 = emailElement.indexOf('\">', index01);
        index02 = emailElement.indexOf('</span>', index01 + 8);
        var subject = emailElement.substring(index01 + 2, index02);
        index01 = emailElement.indexOf('title', index02);
        index02 = emailElement.indexOf('\"', index01 + 8);
        var time = emailElement.substring(index01 + 7, index02);
  
        output += `<tr><td style="width:6%;">${Record}</td><td style="width:36%;">${senderEmail}</td><td style="width:15%;">${senderName}</td><td style="width:28%;">${subject}</td><td style="width:15%;">${time}</td></tr>`;
  
        Record += 1;
        vcount += 1;
      }
    });
  
    output += '</table>';
    return output;
}
  

