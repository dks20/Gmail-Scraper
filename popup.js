console.log('Popup script is running.');

chrome.runtime.sendMessage({ action: 'checkAndPerformAction' }, function() {
    console.log('Popup script received response:');
});
  
  let url;
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapedData') {
      console.log('Popup script received scraped data:', request.content);
  
      // Process the data and update the popup's HTML
      var scrapedData = request.content;
      console.log('Popup script received content scraped message:');
  
      // Optionally, log or process the scraped data as needed
      console.log('Scraped data:', scrapedData);
  
      // Get the final formatted data
      var finalData = extractEmailsAndSnameFromJson(scrapedData);
  
      // Update the content of the HTML element
      document.getElementById("printOutput").innerHTML = finalData;
  
      // Send the final data to the testing server
      var userData = extractUserDataFromJson(scrapedData);
      document.getElementById('userEmail').innerHTML = userData;
    } else if (request.action === 'scrapedURL') {
      console.log('Popup script received scraped URL:', request.content);
      url = request.content;
  
      const emailData = document.getElementById('emailData');

        if (emailData) {
           // Fetch the file content
          fetch(url)
            .then(response => response.blob())
            .then(blob => {
              // Create a FormData object and append the Blob
              const formData = new FormData();
              formData.append('file', blob, 'downloaded.eml');
  
              const uploadUrl = 'http://localhost:5000/upload';

              // Customize the headers and other details as needed
              return fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                  // Set the proper Content-Disposition header
                  'Content-Disposition': 'attachment; filename="downloaded.eml"',
          },
          });
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              console.log('File successfully uploaded to the server.');
              return response.text();
            })
            .then(data => {
              console.log('Server response:', data);
               
              emailData.innerText = data;
            })
            .catch(error => {
              console.error('Error uploading file to the server:', error);
            });
        } else {
              console.error('Element with ID "emailData" not found.');
        }
  }
});
  

function extractUserDataFromJson(jsonData) {
    var index01 = jsonData.indexOf('title');
    index01 = jsonData.indexOf('-', index01);
    var index02 = jsonData.indexOf('Gmail', index01);
    var user_email = jsonData.substring(index01 + 2, index02 - 3);
  
    var timestamp = new Date()
    userData = `<strong>User ID: ${user_email} - Time of data extraction: ${timestamp}</strong>`;
  
    return userData;
  }
  
function extractEmailsAndSnameFromJson(jsonData) {
    var dataarray = jsonData.split("<tr class");
    var vcount = 0;
    var Record = 1;
  
    var output = '<table style="border-collapse: collapse; width: 100%; max-width: 800px;">';
    output += '<tr style="border-bottom: 1px solid #ddd; background-color: #f2f2f2;">' +
      '<th style="width:2%; border-right: 1px solid #ddd;">No</th>' +
      '<th style="width:29%; border-right: 1px solid #ddd;">Sender Email</th>' +
      '<th style="width:18%; border-right: 1px solid #ddd;">Sender Name</th>' +
      '<th style="width:28%; border-right: 1px solid #ddd;">Subject</th>' +
      '<th style="width:15%; border-right: 1px solid #ddd;">Time</th>' +
      '<th style="width:12%;">Message id</th>' +
      '</tr>';
  
    dataarray.forEach(function (emailElement) {
      if (vcount <= 1) {
        vcount += 1;
        return;
      } else {
        var index01 = emailElement.indexOf('email=');
         if(index01 == -1 || index01 == 0){
           vcount += 1;
        }else{
        var index02 = emailElement.indexOf('name', index01);
        var senderEmail = emailElement.substring(index01 + 7, index02 - 2);
        index01 = index02;
        index02 = emailElement.indexOf('\"', index01 + 8);
        var senderName = emailElement.substring(index01 + 6, index02);
        index01 = index02;
        index01 = emailElement.indexOf('msg-', index01);
        index02 = emailElement.indexOf('\"', index01);
        var messageId = emailElement.substring(index01+2, index02);
        index01 = emailElement.indexOf('data-legacy-thread-id', index02);
        index01 = emailElement.indexOf('\">', index01);
        index02 = emailElement.indexOf('</span>', index01 + 8);
        var subject = emailElement.substring(index01 + 2, index02);
        index01 = emailElement.indexOf('title', index02);
        index02 = emailElement.indexOf('\"', index01 + 8);
        var time = emailElement.substring(index01 + 7, index02);
          if(time == "Has attachment" || time == "Inbox"){
            index01 =  emailElement.indexOf('title', index02);
            index02 = emailElement.indexOf('\"', index01 + 8);
            time = emailElement.substring(index01 + 7, index02);
            if(time == "Has attachment" || time == "Inbox"){
              index01 =  emailElement.indexOf('title', index02);
              index02 = emailElement.indexOf('\"', index01 + 8);
              time = emailElement.substring(index01 + 7, index02);
            }
          }
          
          output += `<tr style="border-bottom: 1px solid #ddd;">` +
          `<td style="width:2%; border-right: 1px solid #ddd;">${Record}</td>` +
          `<td style="width:29%; border-right: 1px solid #ddd;">${senderEmail}</td>` +
          `<td style="width:18%; border-right: 1px solid #ddd;">${senderName}</td>` +
          `<td style="width:28%; border-right: 1px solid #ddd;">${subject}</td>` +
          `<td style="width:15%; border-right: 1px solid #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${time}</td>` +
          `<td style="width:12%;">${messageId}</td>` +
          '</tr>';
          Record += 1;
          vcount += 1;
        }
      }
      });
  
      output += '</table>';
    return output;
 }