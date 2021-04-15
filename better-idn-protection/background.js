

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "getURL"){
    sendResponse({url: getURL()})
  }
});

function getURL(){
  var url;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ //lastFocusedWindow: true
    console.log(tabs[0].url);
    url = tabs[0].url;
  });

  return url;
}


/*
if(typeof chrome.webRequest !== 'undefined'){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    // use `url` here inside the callback because it's asynchronous!
});
  chrome.webRequest.onBeforeRequest.addListener(function(details){
      if(!(isValidURL(details.url))){
        console.log("Create that notification!");
        showURL(details.url);
        chrome.notifications.create('', {
          type: 'basic',
          title: 'Potentially Harmful URL Detected',
          message: "The website " + details.url + " might be an IDN-based attack",
          iconUrl: 'icon16.png'
        });
        //return {redirectUrl: 'popup.html'}
        //window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=yes,resizable=no");
        //chrome.storage.sync.set({'url': details.url});
        /*chrome.tabs.create({
            url: chrome.extension.getURL('popup.html'),
            active: false
        }, function(tab){
        chrome.windows.create({
          url: details.url,
            tabId: tab.id,
            type: 'popup',
            focused: true,
            height: 120,
            width: 120
          });
        //});*/
        //chrome.tabs.create({url: 'popup.html'});
        /*
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
          if (request.method == "getURL"){
            sendResponse({url: details.url})
          }
        });
      }
        //chrome.runtime.sendMessage({type:'risky_url', url:details.url});
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
  );
}*/

function isValidURL(url){
  // domain variable (ex. Latin, Cyrillic or Greek)
  var domain = null;

  // valid bool
  var isValid = false;

  // iterate over whole URL element
  for(i = 0; i < url.length; i++){

    // ASCII code of character at position i
    var code = url.charCodeAt(i);

    // if the domain is not yet specified, set domain to
    if(domain == null){

    }
    // domain is specified, check if char is out of domain
    else{

    }
  }

  return isValid;
}

function showURL(url){
  var urlElement = document.getElementById("url");
  urlElement.innerText = url;
}

/*function checkURL(url){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    var url = tabs[0].url;
    isValidURL(url)
  });
  isValidURL(url)
}*/
