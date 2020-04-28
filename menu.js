const SEND_WHATSAPP = "";
const CALL_PHONE = "";
const SHARE_WHATSAPP = "";
const MENU_BASE_URL = "";
var localId;
var localInfo;
var clientAddress;

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
    var url = "/guanmor/menu.html?property="+localId;
    var shortName = localId;
    var name = "Carta de "+localId;
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
handleButtonClick = function () {
  const alert = document.createElement('ion-alert');
  alert.header = 'Dirección de envío';
  alert.inputs = [
    {
      name: 'name2',
      id: 'streetId',
      placeholder: 'Calle'
    },
     {
      name: 'name3',
      id: 'numberId',
      placeholder: 'Número'
    }
  ];
  alert.buttons = [

    {
      text: 'Para recoger',
      handler: () => {
        var clientAddress = "Para recoger"; 
		hacerPedido(clientAddress);
		presentToast("Introduzca el lugar de envío");
        console.log('Confirm Ok')
      }
    }, {
      text: 'Te lo llevamos',
      handler: () => {
      	var street = document.getElementById("streetId").value;
      	var number = document.getElementById("numberId").value;
      	
      	if(street === "" || number === ""){
			presentToast("Introduzca la dirección de envío");      	
      	} else {
			var clientAddress = street + ", "+number; 
			hacerPedido(clientAddress);      	
      	}
        console.log('Confirm Ok')
      }
    }
  ];

  document.body.appendChild(alert);
  return alert.present();
};

presentToast = function (text) {
  const toast = document.createElement('ion-toast');
  toast.message = text;
  toast.duration = 2000;

  document.body.appendChild(toast);
  return toast.present();
}

hacerPedido = function (clientAddress) {
	var cartaContent = document.getElementById("cartaContent").children;
	var pedido = "_Pedido_";
	var pedido = pedido + "\r\n\r\n*Dirección de envío: "+clientAddress+"*";
	
	for(var i=0;i<cartaContent.length;i++){
		if(cartaContent[i].tagName === "ION-LIST"){
			var productsContent = cartaContent[i].children;
			for(var j=0;j<productsContent.length;j++){
				if(productsContent[j].tagName === "ION-ITEM"){
					var product = productsContent[j].children[0];
					var value = product.children[2].value;
					var productName = product.children[0].textContent;
					if(value === "" || value === "0"){
					} else {
					  pedido = pedido + "\r\n\r\n"+"- "+value+" "+productName;
					}			
					
				}
			}
		}
	}
	
	var encodedPedido = window.encodeURIComponent(pedido);
	window.open('whatsapp://send?text='+encodedPedido+'&phone=+34679827962&abid=+34679827962')
}; 
    

