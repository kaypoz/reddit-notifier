function getNotificationHTML(model) {
	return 	'<div data-read-url="' + model.url + '" data-id="' + model.id + '" class="notification">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +
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
        url: ''
      };


      // If the notification is a comment reply
      if(item.kind == 't1') {
        viewModel.id = item.data.name;
        viewModel.title = '<strong>' + item.data.author + '</strong> replied in <strong>' + truncate(item.data.link_title,40) + '</strong>';
        viewModel.url = "http://www.reddit.com" + item.data.context;
        viewModel.body = truncate(item.data.body, 128);

      }

      notificationsHTML += getNotificationHTML(viewModel);
    }
  }

	$("#notifications").html(notificationsHTML);
}

function updateAndDisplayNotifications(callback) {
  chrome.extension.sendRequest({'action' : 'updateNotifications'}, function(response) {
			displayNotifications(response);
      if(callback) callback();
		});
}

function markAsRead(name, modhash) {
  $.ajax({
    type: 'POST',
    url: 'http://www.reddit.com/api/read_message',
    data: {
      id: name,
      uh: modhash
    }
	}).success(function(data) {
    var count = +localStorage.getItem('notificationCount') - 1;
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
		displayNotifications(JSON.parse(notifications));
	}

	$("body").on("click", "[data-read-url]", null, function(event) {

    var notification = $(event.target).closest('.notification');

		var url = notification.data('read-url');
    var id = notification.data('id');
    markAsRead(id, notifications.data.modhash);
		chrome.tabs.create({url: url});
    $(event.target).remove();
	});


  $(".forceRefresh").click(function() {
    $('.forceRefresh').addClass('fa-spin');
    updateAndDisplayNotifications(function() {
      $('.forceRefresh').removeClass('fa-spin');
    });
    setLastUpdateText(moment().format('X'));
  });
  setLastUpdateText(localStorage.getItem('lastUpdate'));
});
