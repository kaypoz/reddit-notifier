
var actions = {
	updateNotifications: function(request, callback) {
		$.ajax({
			type: 'GET',
			url: 'http://www.reddit.com/message/unread.json',
		}).success(function(data) {

			console.log("Requesting Notification Data");

      // Set the notifications and the current time
      localStorage.setItem('notifications', JSON.stringify(data));
      localStorage.setItem('lastUpdate', moment().format('X'));

      // Sets the notification count
      if(typeof data.data.children != "undefined" &&  data.data.children.length > 0) {

        var nCount = data.data.children.length;

        localStorage.setItem('notificationCount', '' + nCount);
        chrome.browserAction.setBadgeText({text: ''+ nCount});
        chrome.browserAction.setIcon({path: 'images/icon.png'});
      } else {

        localStorage.setItem('notificationCount', '0');
        chrome.browserAction.setBadgeText({text: ''});
        chrome.browserAction.setIcon({path: 'images/icongray.png'});
      }

			if(callback) callback(data);
		});
	},
	markAsRead: function(request, callback) {
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
	}
};

setInterval(actions.updateNotifications, 60000);


function onRequest(request, sender, callback) {
	console.log('handling request');
	if(actions.hasOwnProperty(request.action)) {
		actions[request.action](request, callback);
	}
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);

