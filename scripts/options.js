$(document).ready(function() {
    var refreshInterval = localStorage.getItem('refreshInterval');
    
    var playAudio = localStorage.getItem('playAudio');
    
    if(refreshInterval === null) {
        refreshInterval = "60000";
    }
    
    if(playAudio === null) {
        playAudio = "false";
    }
    
	$("#refreshInterval").val(refreshInterval);
    $("#playAudio").val(playAudio);
    
    $("#refreshInterval").on("change", function() {
        localStorage.setItem('refreshInterval', $(this).val());
        chrome.extension.sendRequest({action : 'initNotificationsInterval'});
    });
    
    $("#playAudio").on("change", function() {
        localStorage.setItem('playAudio', $(this).val());
    });
});