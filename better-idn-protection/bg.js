
function getPageURL(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    console.log("Background url: " + tabs[0].url);
    chrome.tabs.sendMessage(tabs[0].id, {url: tabs[0].url}, (response) => {});
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message == "get-page-url"){
    console.log("in here");
    getPageURL();
  }
  else if(message.type == "create-alert"){
    chrome.notifications.create(
      "Warning!",
      {
        type: "basic",
        iconUrl: "icon.png",
        title: "Warning! A recently visited URL might pose a threat.",
        message: "The URL " + message.url + " might be a malicious website.\nThe character " + message.char +
        " belongs to a different Unicode range than the previous characters.\nThis URL might be trying to produce an " +
        "IDN-based phishing attack.",
      },
      function () {}
    );

    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      focused: true
    }, function(win) {
      // win represents the Window object from windows API
      // Do something after opening
    });
  }
});
