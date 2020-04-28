const SEND_WHATSAPP = "";
const CALL_PHONE = "";
const SHARE_WHATSAPP = "";
const MENU_BASE_URL = "https://doliveros1.github.io/guanmor/menu.html";
const API_PATH = "https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/";
const HOME = "./index.html"

var localId;
var propertyInfo;
var clientAddress;

var loading;

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
    showLoading("Cargando la carta");
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
	fetchLocal(idProperty);
}; 

setPropertyInfo = function (idProperty, object){
    propertyInfo = object;
	document.getElementById("propertyName").innerHTML = object.propertyName;
	document.getElementById("callButton").href = "tel:"+object.phoneNumber;
	var text = "Ver carta de "+object.propertyName+" ";
	document.getElementById("shareButton").href = "whatsapp://send?text="+text+" "+MENU_BASE_URL+"?property="+idProperty;
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
        console.log('Confirm Ok')
      }
    }, {
      text: 'Te lo llevamos',
      handler: () => {
      	var street = document.getElementById("streetId").value;
      	var number = document.getElementById("numberId").value;
      	
      	if(street === "" || number === ""){
			presentToast("Introduzca una dirección de envío");      	
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
  toast.duration = 3000;

  document.body.appendChild(toast);
  return toast.present();
}

showLoading = function (text) {
	loading = document.createElement('ion-loading');
  	loading.message = text;
  	document.body.appendChild(loading);
    loading.present();
}
hideLoading = function () {
	loading.dismiss();
}
hacerPedido = function (clientAddress) {
	var cartaContent = document.getElementById("cartaContent").children;
	var pedido = "_Pedido_";
	var pedido = pedido + "\r\n\r\n*Dirección de envío: "+clientAddress+"*";
	var empty = true;
	
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
					  empty = false;
					  pedido = pedido + "\r\n\r\n"+"- "+value+" "+productName;
					}			
					
				}
			}
		}
	}
	
	if(empty) {
		presentToast("No ha seleccionado ningún producto");    	
	} else {
		var encodedPedido = window.encodeURIComponent(pedido);
		window.open('whatsapp://send?text='+encodedPedido+'&phone=+34679827962&abid=+34679827962')
	}
}; 

handleButtonInfoClick = async function handleButtonInfoClick(ev) {
      popover = await popoverController.create({
        component: 'popover-example-page',
        event: ev,
        translucent: true
      });
      currentPopover = popover;
      return popover.present();
    }

    function dismissPopover() {
      if (currentPopover) {
        currentPopover.dismiss().then(() => { currentPopover = null; });
      }
    };

 customElements.define('popover-example-page', class ModalContent extends HTMLElement {
      connectedCallback() {
        var infoString = `<ion-list><ion-list-header>`+propertyInfo.propertyName+`- Información</ion-list-header>`;        
      	if(propertyInfo.homeDelivery){
			infoString = infoString +  `<ion-item><ion-icon name="home-outline"></ion-icon><p>Envío a domicilio</p></ion-item>`;     	
      	}
      	if(propertyInfo.card){
			infoString = infoString +  `<ion-item><ion-icon name="card-outline"></ion-icon><p>Pago con tarjeta</p></ion-item>`;     	   	
      	}
      	if(propertyInfo.cash){
			infoString = infoString +  `<ion-item><ion-icon name="cash-outline"></ion-icon><p>Pago en efectivo</p></ion-item>`;     	   	
      	}

      	infoString = infoString+`<ion-item><ion-icon name="alarm-outline"></ion-icon><p>`+propertyInfo.timeTable+`</p></ion-item>`; 
		var location = propertyInfo.longitude+","+propertyInfo.latitude;
		infoString = infoString + `<ion-item button href="https://www.google.com/maps/search/?api=1&query=`+location+`" target="_blank"><ion-icon name="location-outline"></ion-icon><p>Ubicación</p></ion-item>`; 
		infoString = infoString + `<ion-item button href="tel:`+propertyInfo.phoneNumber+`"><ion-icon name="call-outline"></ion-icon><p>`+propertyInfo.phoneNumber+`</p></ion-item> `
		infoString = infoString+`<ion-item lines="none" detail="false" button onClick="dismissPopover()">Cerrar</ion-item></ion-list>`;

        this.innerHTML = infoString;
      }
    });

//DATA

const fetchLocal = (local) => {
    return axios.get(API_PATH+local,{ crossdomain: true })
        .then(response => {
			hideLoading();
			if(isEmpty(response.data)){
				goToHome();		
			} else{
        		setPropertyInfo(local, response.data);			
			}
        })
        .catch(error => console.error(error));
};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function goToHome(){
	window.location.href = HOME;
}
