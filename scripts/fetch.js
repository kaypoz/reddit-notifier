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
	return 	'<div data-url="' + model.url + '" class="notification">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +
			'</div>';
}


function displayNotifications(notifications) {

	var notificationsHTML = '';
	
	// Loop through each notification
	for(var i = 0, l = notifications.data.children.length; i < l; i++ ) {
		
		// Set up notification and its view model
		var item = notifications.data.children[i];
		var viewModel = {
			title: '',
			body: '',
			url: ''
		};
		
		
		// If the notification is a comment reply
		if(item.kind == 't1') {
			viewModel.title = '<strong>' + item.data.author + '</strong> replied in <strong>' + item.data.link_title + '</strong>';
			viewModel.body = item.data.body;
			viewModel.url = "http://www.reddit.com" + item.data.context; 
		}
		
		notificationsHTML += getNotificationHTML(viewModel);
    }
	
	$("#popup").html(notificationsHTML);
}

$(document).ready(function() {

	var notifications = localStorage.getItem('notifications');
	
	if(notifications === null) {
		chrome.extension.sendRequest({'action' : 'updateNotifications'}, function(response) {
			displayNotifications(response);
		});
	} else {
		displayNotifications(JSON.parse(notifications));
	}
	
	$("body").on("click", "[data-url]", null, function(event) {
		
		var url = $(event.target).closest('.notification').data('url');
		chrome.tabs.create({url: url});
	});
});
