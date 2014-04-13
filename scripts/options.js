$(document).ready(function() {
    var refreshInterval = localStorage.getItem('refreshInterval');
    
    if(refreshInterval === null) {
        refreshInterval = "60000";
    }
	$("#refreshInterval").val(refreshInterval);
    
    $("#refreshInterval").on("change", function() {
        localStorage.setItem('refreshInterval', $(this).val());
        chrome.extension.sendRequest({action : 'initNotificationsInterval'});
    });
});