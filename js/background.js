
// The interval that holds to update notifications task
var updateNotificationsInterval = null;
var updatePostsInterval = null;
var updateCommentsInterval = null;

// chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
// chrome.browserAction.setBadgeText({text:"?"});


var actions = {
	updateNotifications: function(request, callback) {
        if(!!localStorage.getItem('sr-username')) {
            var a = $.ajax({
            	type: 'GET',
            	url: 'https://www.reddit.com/message/inbox.json',
            }).success(function(data) {

                // Set the notifications and the current time
                localStorage.setItem('sr-notifications', JSON.stringify(data));
                localStorage.setItem('sr-lastUpdate', new Date().getTime());

    			if(callback) callback(data);
                a = null;
    		});
        }
	},

    updateComments: function(request, callback) {
        if(!!localStorage.getItem('sr-username')) {
            var username = localStorage.getItem('sr-username');
            var url = 'https://www.reddit.com/user/'+username+'/comments.json'
            var a = $.ajax({
                type: 'GET',
                url: url,
            }).success(function(data) {

                // Set the notifications and the current time
                localStorage.setItem('sr-comments', JSON.stringify(data));
                localStorage.setItem('sr-lastUpdate', new Date().getTime());

                if(callback) callback(data);
                a = null;
            });
        }
    },

    updatePosts: function(request, callback) {
        if(!!localStorage.getItem('sr-username')) {
            var username = localStorage.getItem('sr-username');
            var url = 'https://www.reddit.com/user/'+username+'/submitted.json'
            var a = $.ajax({
                type: 'GET',
                url: url,
            }).success(function(data) {

                // Set the notifications and the current time
                localStorage.setItem('sr-posts', JSON.stringify(data));
                localStorage.setItem('sr-lastUpdate', new Date().getTime());

                if(callback) callback(data);
                a = null;
            });
        }
    },

    getUsername: function() {
        var a = $.ajax({
            type: 'GET',
            url: 'https://www.reddit.com/api/me/.json',
        }).success(function(response) {
            if(!!response) {
                console.log(response);
                if(!!response && !!response.data && !!response.data.name) {
                    localStorage.setItem('sr-username', response.data.name);
                    actions.updateNotifications();
                    actions.updateComments();
                    actions.updatePosts();
                    actions.initNotificationsInterval();
                    setTimeout(actions.initPostsInterval, 100000);
                    setTimeout(actions.initCommentsInterval, 200000);
                }
            }
        });
    },

    initNotificationsInterval: function() {
        var refreshInterval = localStorage.getItem('refreshInterval');

        if(refreshInterval === null) {
            refreshInterval = 300000;
        } else {
            refreshInterval = +refreshInterval;
        }

        if(updateNotificationsInterval) {
            clearInterval(updateNotificationsInterval);
        }
        updateNotificationsInterval = setInterval(actions.updateNotifications, refreshInterval);
    },

    initCommentsInterval: function() {
        var refreshInterval = localStorage.getItem('refreshInterval');

        if(refreshInterval === null) {
            refreshInterval = 300000;
        } else {
            refreshInterval = +refreshInterval;
        }

        if(updateCommentsInterval) {
            clearInterval(updateCommentsInterval);
        }
        updateCommentsInterval = setInterval(actions.updateComments, refreshInterval);
    },

    initPostsInterval: function() {
        var refreshInterval = localStorage.getItem('refreshInterval');

        if(refreshInterval === null) {
            refreshInterval = 300000;
        } else {
            refreshInterval = +refreshInterval;
        }

        if(updatePostsInterval) {
            clearInterval(updatePostsInterval);
        }
        updatePostsInterval = setInterval(actions.updatePosts, refreshInterval);
    }
};

localStorage.setItem('refreshInterval', 300000);

actions.getUsername();
