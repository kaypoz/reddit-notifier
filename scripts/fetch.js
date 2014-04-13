/*
function fetch_feed() {
  chrome.extension.sendRequest({'action' : 'fetch_feed', 'url' : 'http://feeds.gawker.com/lifehacker/full'},
    function(response) {
      display_stories(response);
    }
  );
}

function display_stories(feed_data) {
  var xml_doc = $.parseXML(feed_data);
  $xml = $(xml_doc);
  $('#popup').html('<img src="images/logo.png" id="logo" /><br clear="all" />');
  $('#logo')[0].addEventListener('click', function() {
    open_item('http://lifehacker.com/')
    window.close() } )

  var items = $xml.find("item");
  items.each(function(index, element) {
    var post = parse_post(element);
    var item = '';
    var class2 = '';
    if (index >= localStorage['unread_count']) {
      // // console.log('visited');
      item += '<div class="post read">';
    }
    else {
      item += '<div class="post">'
    }
    item += '<span class="tag">' + post.tag + '</span>\
          <a href="' + post.url + '">\
            <div id="' + post.id + '" class="item">\
              <img src="' + post.img + '" width="107" height="60" />\
              <h4>' + post.title + '</h4>\
              <span class="description">' + post.description + '...</span>\
            </div>\
          </a>';
    item += '</div>';
    $('#popup').append(item);
    // TODO why isn't jQuery's .on defined?
    var $item = $('div[id="' + post.id + '"]')
    console.log('$item', $item)
    $item[0].addEventListener('click', function() {
      open_item(post.url) } )
  });
}
*/

function getNotificationHTML(model) {
	return 	'<div data-url="' + model.url + '" class="notification group">' +
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
        title: '',
        body: '',
        url: '',
		date: ''
      };
	

      // If the notification is a comment reply
      if(item.kind == 't1') {
        viewModel.title = '<strong>' + item.data.author + '</strong> replied in <strong>' + truncate(item.data.link_title,40) + '</strong>';
        viewModel.url = "http://www.reddit.com" + item.data.context;
        viewModel.body = truncate(item.data.body, 128);
		viewModel.date= moment(item.data.created_utc, 'X').fromNow();
		
      }
	  if(item.kind=='t4'){
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
  chrome.extension.sendRequest({'action' : 'updateNotifications'}, function(response) {
			displayNotifications(response);
      if(callback) callback();
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

	$("body").on("click", "[data-url]", null, function(event) {

		var url = $(event.target).closest('.notification').data('url');
		chrome.tabs.create({url: url});
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
