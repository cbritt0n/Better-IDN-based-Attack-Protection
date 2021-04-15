/*chrome.runtime.onMessage.addListener(function(request){
  console.log(request.type);
  if(request.type == 'risky_url'){
    showURL(request.url);
  }
});*/

function updatePopup() {
  chrome.storage.sync.get(['url'], function(data){
    document.getElementById("url").innerText = data.url;
  });
}
document.addEventListener('DOMContentLoaded', updatePopup);

/*
chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
  document.getElementById("url").innerText = tab.url;
});
*/

/*chrome.runtime.sendMessage({method: "getURL"}, function(res){
    document.getElementById("url").innerText = res.url;
    return true;
});*/

/*function showURL(url){
  var urlElement = document.getElementById("url");
  urlElement.innerText = url;
}*/
