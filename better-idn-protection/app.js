var url = null;

chrome.runtime.sendMessage({method: "getURL"}, function(res){
  console.log(res.url);
  url = res.url;
  console.log(url);
});

console.log("URL is: " + url);
