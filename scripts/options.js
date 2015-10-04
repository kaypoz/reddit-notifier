$(document).ready(function() {
    var refreshInterval = localStorage.getItem('refreshInterval');
    
    var playAudio = localStorage.getItem('playAudio');

    var showDesktopNotifications = localStorage.getItem('showDesktopNotifications');
    
    if(refreshInterval === null) {
        refreshInterval = "60000";
    }
    
    if(playAudio === null) {
        playAudio = "false";
    }

    if (showDesktopNotifications === null) {
        showDesktopNotifications = "false";
    }
    
	$("#refreshInterval").val(refreshInterval);
    $("#playAudio").val(playAudio);
    $("#showDesktopNotifications").val(showDesktopNotifications);

    $("#refreshInterval").on("change", function() {
        localStorage.setItem('refreshInterval', $(this).val());
        chrome.extension.sendRequest({action : 'initNotificationsInterval'});
    });
    
    $("#playAudio").on("change", function() {
        localStorage.setItem('playAudio', $(this).val());
    });

    $("#showDesktopNotifications").on("change", function() {
        localStorage.setItem('showDesktopNotifications', $(this).val());
    });
});