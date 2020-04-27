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
    var url = "/guanmor/menu.html";
    var name = "Carta de "+localId;
    
    var myDynamicManifest = {
  		"name": name,
  		"short_name": localId,
  		"description": "Something dynamic",
  		"start_url": url,
  		"background_color": "#000000",
  		"theme_color": "#0f4a73",
  		"icons": [{
    		"src": "icon/icon.png",
    		"sizes": "192x192",
    		"type": "image/png"
  		}]
	}
	const stringManifest = JSON.stringify(myDynamicManifest);
	const blob = new Blob([stringManifest], {type: 'application/json'});
	const manifestURL = URL.createObjectURL(blob);
	document.querySelector('#my-manifest-placeholder').setAttribute('href', manifestURL);
    
	/*var full = window.location.host; // subdomain.domain.com
	var parts = full.split('.');
	var sub = parts[0];
	link = document.createElement('link');
	link.href = 'https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/'+localId+'/manifest';
	link.rel = 'manifest';
	document.getElementsByTagName('head')[0].appendChild(link);*/
    
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
	var propertyInfo = JSON.parse("{\"propertyName\":\""+idProperty+"\",\"whatsapp\":\"666100015\",\"phoneNumber\":\"925190457\",\"homeDelivery\":false,\"cash\":false,\"card\":false,\"timeTable\":\"L-V de 9:00 a 21:00, S y D 9:00 a 23:00\"}");
	
	//if (idProperty === "000001") {
		setPropertyInfo(propertyInfo);
	//}
}; 

setPropertyInfo = function (propertyInfo){
	document.getElementById("propertyName").innerHTML = propertyInfo.propertyName;
};

    
