
var actions = {
	updateNotifications: function(callback) {
		$.ajax({
			type: 'GET',
			url: 'http://www.reddit.com/message/inbox.json',
		}).success(function(data) {
			console.log("Requesting Notification Data");
			localStorage.setItem('notifications', JSON.stringify(data));
      localStorage.setItem('lastUpdate', moment().format('X'));

      if(typeof data.data.children != "undefined" &&  data.data.children.length > 0) {
        chrome.browserAction.setBadgeText({text: ''+data.data.children.length});
      }

			if(callback) callback(data);
		});
	}
};

setInterval(actions.updateNotifications, 60000);


function onRequest(request, sender, callback) {
	console.log('handling request');
	if(actions.hasOwnProperty(request.action)) {
		actions[request.action](callback);
	}
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);

