function getNotificationHTML(model) {
	return 	'<div data-read-url="' + model.url + '" data-id="' + model.id + '" class="notification group">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +
			'<span class="date">' + model.date + '</span>' +
			'</div>';
}


function displayNotifications(notifications) {

	var notificationsHTML = '';

	// Loop through each notification

  var length = notifications.data.children.length;

  if(length == 0) {
    notificationsHTML = '<div class="no-notifications"><h4>No notifications.</h4></div>';
  } else {

    for(var i = 0; i < length; i++ ) {

      // Set up notification and its view model
      var item = notifications.data.children[i];
      var viewModel = {
        id: '',
        title: '',
        body: '',
        url: '',
		date: ''
      };
	

      // If the notification is a comment reply
      if(item.kind == 't1') {
        viewModel.id = item.data.name;
        viewModel.title = '<strong>' + item.data.author + '</strong> replied in <strong>' + truncate(item.data.link_title,40) + '</strong>';
        viewModel.url = "http://www.reddit.com" + item.data.context;
        viewModel.body = truncate(item.data.body, 128);
		viewModel.date= moment(item.data.created_utc, 'X').fromNow();
		
      }
	  if(item.kind=='t4'){
	  viewModel.id = item.data.name;
	  viewModel.url="http://www.reddit.com/message/messages/"+ item.data.id;
	  viewModel.title= '<strong>' + item.data.author + '</strong> messaged you <strong>' + truncate(item.data.subject,40) + '</strong>';
	  viewModel.body = truncate(item.data.body,128);
	  viewModel.date= moment(item.data.created_utc, 'X').fromNow();

	  }

      notificationsHTML += getNotificationHTML(viewModel);
    }
  }

	$("#notifications").html(notificationsHTML);
}

function updateAndDisplayNotifications(callback) {
  chrome.extension.sendRequest({action : 'updateNotifications'}, function(response) {
			displayNotifications(response);
      if(callback) callback(response);
		});
}

function markAsRead(name, modhash, callback) {
   chrome.extension.sendRequest({action: 'markAsRead', name: name, modhash: modhash}, callback);
}

function setLastUpdateText(lastUpdate) {

  if(lastUpdate === null) {
    lastUpdate = "Never";
  } else {
    lastUpdate = moment(lastUpdate).fromNow();
  }

  $(".lastUpdate").html(lastUpdate);

}
function truncate(text,length){
	if(text.length > length){
		text = text.substring(0,length);
		if(text.charAt(text.length - 1 ) != " "){
			var lastSpace = text.lastIndexOf(" ");
			text = text.substring(0, lastSpace);
		}
		text += "...";
	}

	return text;
	// truncates input to defined length while ensuring that the text always ends in a full word
}
$(document).ready(function() {

	var notifications = localStorage.getItem('notifications');

	if(notifications === null) {
		updateAndDisplayNotifications();
	} else {
		notifications = JSON.parse(notifications);
		displayNotifications(notifications);
	}

	$("body").on("click", "[data-read-url]", null, function(event) {
	
	var notifications = JSON.parse(localStorage.getItem('notifications'));
	
    var notification = $(event.target).closest('.notification');

		var url = notification.data('read-url');
    var id = notification.data('id');
	
	var foundNotification = false;
	var i = 0;
	
	for(; i < notifications.data.children.length; i++) {
		if(notifications.data.children[i].data.name == id)  {
			foundNotification = true;
			break;
		}
	}
	if(foundNotification) {
		notifications.data.children.splice(i, 1);
		localStorage.setItem('notifications', JSON.stringify(notifications));
	}
	
	//markAsRead(id, notifications.data.modhash, function() {
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
	
	chrome.tabs.create({url: url});
	//});

	});
	
	$(".openOptions").click(function() {
		chrome.tabs.create({url: 'options.html'});
	});


  $(".forceRefresh").click(function() {
    $('.forceRefresh').addClass('fa-spin');
	setTimeout(function() {
        $('.forceRefresh').removeClass('fa-spin');
    }, 1000)
	//causes spinner to go around a minimum of one cycle
	
    updateAndDisplayNotifications(function() {
setTimeout(updateAndDisplayNotifications);
	  
    });



	
    setLastUpdateText(moment().format('X'));
  });
  setLastUpdateText(localStorage.getItem('lastUpdate'));
});
