checkIncognito();

function checkIncognito(e) {
	chrome.extension.isAllowedIncognitoAccess(function(result) {
		var el = document.getElementById('incognito');
		el.className = result ? 'hasIncognito': 'noIncognito';

		document.getElementById('incognitoButton').textContent = result ? "Disable incognito access" : "Enable incognito access";
	});
}

var el = document.getElementById('incognitoButton');
el.onclick = function(e) {
	chrome.tabs.create({url:'chrome://extensions/?id=' + chrome.runtime.id});
}


function forceBox() {
	var el = document.getElementById('force');
	if(el.checked) {
		chrome.storage.sync.set({"simple-reddit-force-layout": true}, function() {});
	}else{
		chrome.storage.sync.set({"simple-reddit-force-layout": false}, function() {});
	}
}

chrome.storage.sync.get(['simple-reddit-force-layout'], function(result) {
	var el = document.getElementById('force');
	el.checked = !!result["simple-reddit-force-layout"];
});

function defaultBox() {
	var el = document.getElementById('default-layout');
	if(el.checked) {
		chrome.storage.sync.set({"simple-reddit-default-layout": true}, function() {});
	}else{
		chrome.storage.sync.set({"simple-reddit-default-layout": false}, function() {});
	}
}

chrome.storage.sync.get(['simple-reddit-default-layout'], function(result) {
	var el = document.getElementById('default-layout');
	var defaultLayout = result["simple-reddit-default-layout"] || true;
	el.checked = defaultLayout;
});


document.getElementById('default-layout').onclick = forceBox;
document.getElementById('force').onclick = forceBox;