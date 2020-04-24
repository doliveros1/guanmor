const SEND_WHATSAPP = "";
const CALL_PHONE = "";
const SHARE_WHATSAPP = "";
const MENU_BASE_URL = "";
var localId;

// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/guanmor/service-worker.js');
  });
}

let deferredPrompt;

window.onload = (e) => { 
	window.addEventListener('beforeinstallprompt', (e) => {
		deferredPrompt = e;
    });
    localId = GetURLParameter('property');
    
    getPropertyInfo(localId);
}

GetURLParameter = function (sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++){
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam){
            return sParameterName[1];
		}
	}
};   

getPropertyInfo = function (idProperty) {
	var propertyInfo = JSON.parse("{\"propertyName\":\"Rte. San Blas\",\"whatsapp\":\"666100015\",\"phoneNumber\":\"925190457\",\"homeDelivery\":false,\"cash\":false,\"card\":false,\"timeTable\":\"L-V de 9:00 a 21:00, S y D 9:00 a 23:00\"}");
	
	//if (idProperty === "000001") {
		setPropertyInfo(propertyInfo);
	//}
}; 

setPropertyInfo = function (propertyInfo){
	document.getElementById("propertyName").innerHTML = propertyInfo.propertyName;
};

    
