/*
	Check if night mode was enabled, then apply night mode or day mode css immediately
*/
chrome.storage.sync.get(['simple-reddit-night-mode'], function(result) {
	var darkMode = result["simple-reddit-night-mode"] || false;
	if(darkMode) {
		nightMode();
	} else {
		dayMode();
	}
});

checkNightmode();
setTimeout(checkNightmode, 250);
setTimeout(checkNightmode, 500);
setTimeout(checkNightmode, 750);
setTimeout(checkNightmode, 1000);
setTimeout(checkNightmode, 2000);
setInterval(checkNightmode, 3000);

/*
	Inactive expando buttons keep changing the classname, so we check for them
	here instead
*/
hideUselessExpando();
setInterval(hideUselessExpando, 3000);

/*
	Initially the left menu is open ( login / sign up )
	Auto-close it
*/
hideHamburger();
setTimeout(hideHamburger, 1500);

attachLinks();
setTimeout(attachLinks, 250);
setTimeout(attachLinks, 500);
setTimeout(attachLinks, 750);
setTimeout(attachLinks, 1000);
setInterval(attachLinks, 1500);
/*
	Get local storage settings for the extension
	Apply default layout switching if the option is set
	Set the new layout cookie if the option is set
*/
chrome.storage.sync.get(['simple-reddit-force-layout', 'simple-reddit-default-layout'], function(result) {
	var forceLayout = result["simple-reddit-force-layout"] || false;
	var defaultLayout = result["simple-reddit-default-layout"] || true;
	if (forceLayout) {

		var docCookies = {
			getItem: function(sKey) {
				if (!sKey) {
					return null;
				}
				return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
			},
			setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
				if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
					return false;
				}
				var sExpires = "";
				if (vEnd) {
					switch (vEnd.constructor) {
						case Number:
							sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
							/*
							Note: Despite officially defined in RFC 6265, the use of `max-age` is not compatible with any
							version of Internet Explorer, Edge and some mobile browsers. Therefore passing a number to
							the end parameter might not work as expected. A possible solution might be to convert the the
							relative time to an absolute time. For instance, replacing the previous line with:
							*/
							/*
							sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; expires=" + (new Date(vEnd * 1e3 + Date.now())).toUTCString();
							*/
							break;
						case String:
							sExpires = "; expires=" + vEnd;
							break;
						case Date:
							sExpires = "; expires=" + vEnd.toUTCString();
							break;
					}
				}
				document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
				return true;
			},
			removeItem: function(sKey, sPath, sDomain) {
				if (!this.hasItem(sKey)) {
					return false;
				}
				document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
				return true;
			},
			hasItem: function(sKey) {
				if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
					return false;
				}
				return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
			},
			keys: function() {
				var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
				for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
					aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
				}
				return aKeys;
			}
		};

		if (docCookies.getItem("rseor3") != true) {
			docCookies.setItem("rseor3", "true", 720000, "/", ".reddit.com");
		}
	}

	if(defaultLayout) {
		var classic = document.getElementById('layoutSwitch--classic');
		if(!!classic) classic.click();
	}
});

function attachLinks() {
	attachProfileLink();
	colorCodes();
}

window.username = "";

function colorCodes() {
	var spans = document.querySelectorAll('span');
	spans.forEach(function(span) {
		var textContent = [].reduce.call(span.childNodes, function(a, b) { return a + (b.nodeType === 3 ? b.textContent : ''); }, '');
		if(textContent.indexOf(" points") > -1) {
			if(span.classList.contains("comments")) return;
			var points = textContent.split(" points")[0];
			span.classList.add("comments");
			if(points.indexOf("-") === 0) {
				span.classList.add("minus");
			}else if(points.indexOf("k") > -1) {
				span.classList.add("kk");
			}else if(points > 99) {
				span.classList.add("hundreds");
			}else if(points > 9) {
				span.classList.add("tens");
			}
		}
	});
}

function attachProfileLink() {
	var dropdown = document.getElementById('USER_DROPDOWN_ID');
	if(	!!dropdown &&
		!!dropdown.firstElementChild &&
		!!dropdown.firstElementChild.firstElementChild &&
		!!dropdown.firstElementChild.firstElementChild.children &&
		!!dropdown.firstElementChild.firstElementChild.children[1]
	) {
		var usernameChild = dropdown.firstElementChild.firstElementChild.children[1].firstElementChild;
		if(!!usernameChild) {
			var username = dropdown.firstElementChild.firstElementChild.children[1].firstElementChild.textContent;
			if(!username || username.length < 1 || username.indexOf("\n") > -1 || username.indexOf("|") > -1) return;
			window.username = username;

			var a = document.createElement('a');
			var linkText = document.createTextNode(username);
			a.appendChild(linkText);
			a.title = username;
			a.href = "/user/" + username;
			usernameChild.innerText = "";
			usernameChild.appendChild(a);

			usernameChild.innerHTML += " (";

			var b = document.createElement('a');
			var linkText = document.createTextNode("p");
			b.appendChild(linkText);
			b.title = "Your Posts";
			b.className = "customHeaderLink";
			b.href = "/user/" + username + "/posts/";
			usernameChild.appendChild(b);

			usernameChild.innerHTML += "|";

			var c = document.createElement('a');
			var linkText = document.createTextNode("c");
			c.appendChild(linkText);
			c.title = "Your Comments";
			c.className = "customHeaderLink";
			c.href = "/user/" + username + "/comments/";
			usernameChild.appendChild(c);

			usernameChild.innerHTML += ")";

			usernameChild.onclick = function(e) {
				e.stopPropagation();
			};
		}
	}
}

function hideHamburger() {
	var ham = document.getElementById('hamburgers');
	if (!!ham) {
		var cl = ham.getClientRects();
		if (!!cl && !!cl[0]) {
			if (cl[0].left > -1) {
				var button = document.getElementById('header').getElementsByTagName('button');
				if (button && button.length > 0 && !!button[0]) {
					button[0].click();
				}
			}
		}
	}
}

function hideUselessExpando() {
	var expandos = document.getElementsByClassName('icon-expandoArrowExpand');
	for (var i =expandos.length - 1; i >= 0; i--) {
		if(!expandos[i].parentElement.hasAttribute('data-click-id')) {
			expandos[i].parentElement.style.display = "none";
		}
	};
}

function checkNightmode() {
	var root = document.querySelector('div[data-reactroot');
	if(!!root) {
		var compStyle = window.getComputedStyle( root ,null);
		if(!!compStyle) {
			var rgb = compStyle.getPropertyValue('background-color');
			var hex = '#' + rgb.substr(4, rgb.indexOf(')') - 4).split(',').map((color) => parseInt(color).toString(16)).join('');
			if(!!hex && hex == "#1a1a1b") {
				nightMode();
			}
			if(!!hex && hex == "#ffffff") {
				dayMode();
			}
		}
	}
}

function dayMode() {
	if (!!document.body && document.body.classList.contains('sr-nightmode')) document.body.classList.remove('sr-nightmode');
	if (!!document.body && document.body.classList.contains('sr-daymode')) return;
	if (!!document.body) document.body.classList.add('sr-daymode');
	chrome.storage.sync.set({"simple-reddit-night-mode": false}, function() {});
}

function nightMode() {
	if (!!document.body && document.body.classList.contains('sr-daymode')) document.body.classList.remove('sr-daymode');
	if (!!document.body && document.body.classList.contains('sr-nightmode')) return;
	if (!!document.body) document.body.classList.add('sr-nightmode');
	chrome.storage.sync.set({"simple-reddit-night-mode": true}, function() {});
}

console.log("Simple Reddit loaded")



