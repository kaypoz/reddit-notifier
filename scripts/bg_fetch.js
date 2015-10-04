
// The interval that holds to update notifications task
var updateNotificationsInterval = null;

var lastNotificationCount = 0;

var actions = {
	updateNotifications: function(request, callback) {
		$.ajax({
			type: 'GET',
			url: 'https://www.reddit.com/message/unread.json',
		}).success(function(data) {

      // Set the notifications and the current time
      localStorage.setItem('notifications', JSON.stringify(data));
      localStorage.setItem('lastUpdate', moment().format('X'));

      // Sets the notification count
      if(typeof data.data.children != "undefined" &&  data.data.children.length > 0) {

        var nCount = data.data.children.length;

        localStorage.setItem('notificationCount', '' + nCount);
		chrome.browserAction.setBadgeBackgroundColor({ color: [255, 123, 85, 255] });
        chrome.browserAction.setBadgeText({text: ''+ nCount});
        chrome.browserAction.setIcon({path: 'images/icon.png'});
        
        if(nCount > lastNotificationCount && localStorage.getItem('playAudio') === "true") {
            var audio = new Audio("pop.mp3");
            audio.play();
        }
        lastNotificationCount = nCount;

        var desktopNotificationTemplate = {
            type: 'basic',
            title: '',
            message: '',
            iconUrl: 'images/128.png'
        };
        data.data.children.forEach(function(element, index, array){
            if(element.kind == 't1') {
                // Comment Reply
                desktopNotificationTemplate.title = element.data.author + ' replied in ' + element.data.link_title;
            } else if(element.kind == 't4') {
                // Private Message
                desktopNotificationTemplate.title = element.data.author + ' messaged you "' + element.data.subject + '"';
            } else {
                desktopNotificationTemplate.title = item.data.subject?item.data.subject:'New Message';
            }
            desktopNotificationTemplate.message = element.data.body;
            chrome.notifications.create(element.data.name, desktopNotificationTemplate);
        });
      } else {

        localStorage.setItem('notificationCount', '0');
        chrome.browserAction.setBadgeText({text: ''});
        chrome.browserAction.setIcon({path: 'images/icongray.png'});
        lastNotificationCount = 0;
      }

			if(callback) callback(data);
		});
	},
	markAsRead: function(request, callback) {
        if(request.name.substring(0, 2) == "t4") {
            $.ajax({
                type: 'POST',
                url: 'http://www.reddit.com/api/read_message',
                data: {
                  id: request.name,
                  uh: request.modhash
                }
                }).success(function(data) {
                if(callback) callback();
            });
        } else {
            $.ajax({
                type: 'GET',
                url: 'http://www.reddit.com/message/unread',
                }).success(function(data) {
                if(callback) callback();
            });
        }
	},
    
    initNotificationsInterval: function() {
        var refreshInterval = localStorage.getItem('refreshInterval');

        if(refreshInterval === null) {
            refreshInterval = 60000;
        } else {
            refreshInterval = +refreshInterval;
        }

        if(updateNotificationsInterval) {
            clearInterval(updateNotificationsInterval);
        }
        updateNotificationsInterval = setInterval(actions.updateNotifications, refreshInterval);
    }
};

actions.initNotificationsInterval();

function onRequest(request, sender, callback) {
	if(actions.hasOwnProperty(request.action)) {
		actions[request.action](request, callback);
	}
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);

chrome.notifications.onClicked.addListener(function(id){
    var notifications = JSON.parse(localStorage.getItem('notifications'));
    // find notification with id
    var results = $.grep(notifications.data.children, function(element){return element.data.name == id; })
    if (results.length > 0){
        actions.markAsRead({action: 'markAsRead', name: results[0].data.name, modhash: notifications.data.modhash}, function(){
            if(results[0].kind == 't1'){
                // Comment Reply
                chrome.tabs.create({url: "http://www.reddit.com" + results[0].data.context});
            } else if (results[0].kind == 't4'){
                // Private Message
                chrome.tabs.create({url: "http://www.reddit.com/message/messages/" + results[0].data.name.substring(3)});
            } else {
                chrome.tabs.create({url: "http://www.reddit.com/message/unread"});
            }

            for(var i = 0; i < notifications.data.children.length; i++) {
                if(notifications.data.children[i].data.name == results[0].data.name)  {
                    notifications.data.children.splice(i, 1);
                    localStorage.setItem('notifications', JSON.stringify(notifications));
                    break;
                }
            }

            var count = (+localStorage.getItem('notificationCount')) - 1;
            if(count <= 0) {
                localStorage.setItem('notificationCount', '0');
                chrome.browserAction.setBadgeText({text: ''});
                chrome.browserAction.setIcon({path: 'images/icongray.png'});
            } else {
                localStorage.setItem('notificationCount', '' + count);
                chrome.browserAction.setBadgeText({text: '' + count});
                chrome.browserAction.setIcon({path: 'images/icon.png'});
            }
        });
        chrome.notifications.clear(results[0].data.name);
    }
});
