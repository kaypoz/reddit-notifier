
var actions = {
	updateNotifications: function(callback) {
		$.ajax({
			type: 'GET',
			url: 'http://www.reddit.com/message/inbox.json',
		}).success(function(data) {
			console.log("Requesting Notification Data");
			localStorage.setItem('notifications', JSON.stringify(data));
			callback(data);
		});
	}
};


function onRequest(request, sender, callback) {
	console.log('handling request');
	if(actions.hasOwnProperty(request.action)) {
		actions[request.action](callback);
	}
}

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);

