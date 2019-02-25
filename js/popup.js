window.onload = function() {

	var notifications = JSON.parse(localStorage.getItem('sr-notifications'));
	var comments = JSON.parse(localStorage.getItem('sr-comments'));
	var posts = JSON.parse(localStorage.getItem('sr-posts'));
	var lastUpdate = JSON.parse(localStorage.getItem('sr-lastUpdate'));

	var converter = new showdown.Converter();

	var children = [];
	for(var comment of comments.data.children) children.push(comment);
	for(var post of posts.data.children) children.push(post);
	for(var message of notifications.data.children) children.push(message);

	children.sort(function(a, b) {
		if(a.data.created_utc > b.data.created_utc) return -1
		return 1;
	})

	var el = document.getElementById("root");
	var html = "";
	html += "<div style='float:right'>updated " + timeSince(lastUpdate/1000) + " ago</div>";

	html += "<table cellpadding=10 cellspacing=0 width='100%'>";

	for(var comment of children) {
    //console.log(comment.data);
    //console.log(comment.data.link_permalink);
    //console.log(comment.data.link_url);
    //console.log(comment.data.url);
    var permalink = "https://www.reddit.com" + (comment.data.permalink || comment.data.context);
    //console.log(permalink);

		var body = comment.data.title || comment.data.body || "";
    body = decodeHtml(body);
		body = converter.makeHtml(body.trim());
		body = htmlSubstring(body, 100);
		var bg = fadeAgo( comment.data.created_utc );
		if(comment.data.score < 2) bg *= 0.5;
		html += "<tr style='opacity:"+bg+"'><td align='right' valign='top'><h3>";
		html += comment.data.score;
    html += "</h3></td><td valign='top'>" +body;
		html += "</td><td valign='top' align='right'>";
		html += "<a target='_blank' href='" + (permalink) + "' title='"+(permalink)+"'><small>";
		html += timeSince(comment.data.created_utc) + "&nbsp;ago";
		html += "</small></a>";
    html += "<br /><small>u/" + comment.data.author  + "</small>";
    html += "</td></tr>";
	}

	html += "</table>";

	el.innerHTML = html;

}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function fadeAgo(date) {
	var seconds = Math.floor(((new Date().getTime()/1000) - date))
	var opacity = 1- (seconds/100000);
	if(opacity < 0.2) opacity = 0.2;
	return opacity;
}

function timeSince(date) {

  var seconds = Math.floor(((new Date().getTime()/1000) - date))

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + "&nbsp;years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + "&nbsp;months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + "&nbsp;days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + "&nbsp;hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + "&nbsp;minutes";
  }
  return Math.floor(seconds) + "&nbsp;seconds";
}

function decodeHTMLEntities (str) {
  if(str && typeof str === 'string') {
    // strip script/html tags
    str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
    str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
  }

  return str;
}

function htmlSubstring(s, n) {
    var m, r = /<([^>\s]*)[^>]*>/g,
        stack = [],
        lasti = 0,
        result = '';

    //for each tag, while we don't have enough characters
    while ((m = r.exec(s)) && n) {
        //get the text substring between the last tag and this one
        var temp = s.substring(lasti, m.index).substr(0, n);
        //append to the result and count the number of characters added
        result += temp;
        n -= temp.length;
        lasti = r.lastIndex;

        if (n) {
            result += m[0];
            if (m[1].indexOf('/') === 0) {
                //if this is a closing tag, than pop the stack (does not account for bad html)
                stack.pop();
            } else if (m[1].lastIndexOf('/') !== m[1].length - 1) {
                //if this is not a self closing tag than push it in the stack
                stack.push(m[1]);
            }
        }
    }

    //add the remainder of the string, if needed (there are no more tags in here)
    result += s.substr(lasti, n);

    //fix the unclosed tags
    while (stack.length) {
        result += '</' + stack.pop() + '>';
    }

    return result;

}
