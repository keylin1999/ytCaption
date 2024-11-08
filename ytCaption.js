let scriptElement = document.createElement('script')
scriptElement.src = chrome.runtime.getURL('src/main.js');
document.body.appendChild(scriptElement)
