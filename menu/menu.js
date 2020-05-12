const HOME = "./index.html"
const MENU_BASE_URL = "https://www.ilovemenu.es/menu/menu.html";
const SERVICE_WORKER = '/menu/service-worker.js';
//const API_PATH = "https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/";
const API_PATH = "http://localhost:8080/api/guanmor/1.0.0/local/";

var localId;
var propertyInfo;
var propertyMenu;

var clientAddress;

var inputCon = 0;
var loading;
var numProductos=0;

var isPickUp = false;
var isToHome =  false;

var currentPopover;

var searchbar;
var shareHref = "";

var refresher;

var orderEnabled = false;
var selectedAllergens = {};
var selectedAllergenProduct = "";

// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SERVICE_WORKER);
  });
}

let deferredPrompt;

window.onload = (e) => { 
	window.addEventListener('beforeinstallprompt', (e) => {
		deferredPrompt = e;
	});
	try{
		localId = window.atob(GetURLParameter('property'));
	} catch(e){
		goToHome();
	}
	
    searchbar = document.querySelector('ion-searchbar');
    searchbar.addEventListener('ionInput', handleInputSearchBar);
    showLoading("Cargando la carta");
    getPropertyInfo(localId);
    
}

GetURLParameter = function (sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++){
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam){
			var code = sParameterName[1];
			code = code.replace("%3D","");
            return code;
		}
	}
};   

getPropertyInfo = function (idProperty) {
	fetchLocal(idProperty);
}; 

setPropertyInfo = function (idProperty, object){
	propertyInfo = object;
	orderEnabled = propertyInfo.orderEnabled;
	document.getElementById("propertyName").innerHTML = object.propertyName;
	//document.getElementById("callButton").href = "tel:"+object.phoneNumber;
	var text = "Ver carta de "+object.propertyName;
    shareHref = "whatsapp://send?text="+text+" "+MENU_BASE_URL+"?property="+window.btoa(idProperty);
    document.getElementById("shareButton").href=shareHref;
    document.getElementById("backButton").href=HOME+"?zipCode="+propertyInfo.codPostal;
    
};

setMenuInfo = function (object){
    propertyMenu = object;
	updateMenuInfo(propertyMenu);
	 
};

refresh = function (){
	showLoading("Cargando la carta");
    getPropertyInfo(localId);
};

updateMenuInfo = function (menu){
	var menuContent = document.getElementById("menuContent");

	var inner = "";
	
	menu[0].categories.forEach(category => {
		if(category.enable){
			inner = inner + `<ion-list class="bg-transparent"><ion-list-header class="categoryTitle">`;
			inner = inner + category.title + `</ion-list-header>`;
			inner = inner + updateCategoryProducts(category.products);
			inner = inner + `</ion-list>`;
		}
	});
	
	inner = inner + `<ion-item text-center><ion-label class="ion-text-wrap" color="danger">`;
	inner = inner + menu[0].sugerencias + `</ion-label></ion-item>`;
	inner = inner + `<ion-item text-center><ion-label class="ion-text-wrap" color="danger">`;
	inner = inner + menu[0].nota + `</ion-label></ion-item>`;

	inner = inner + `<ion-fab horizontal="end" vertical="bottom" slot="fixed">
	<ion-fab-button onclick="handleButtonClick()" color="vibrant">
      <ion-icon name="cart-outline"></ion-icon>
      <ion-badge id="cart-badge2" color="danger"></ion-badge>

	</ion-fab-button>
  </ion-fab>`;
  
	menuContent.innerHTML = inner;
};

updateCategoryProducts = function(categoryProducts){
	var products = "";
	categoryProducts.forEach(prod =>{
		if(prod.enable){
			var idInput = "pvpInput"+inputCon;
			inputCon = inputCon + 1;
			var product = `<ion-item class="productItem">
			<ion-grid>
					<ion-row>
						<ion-col size=9>
							<div style="align:right;"><ion-label class="productItemTitle ion-text-wrap">`+prod.title+`
							</ion-label></div>
						</ion-col>
						<ion-col  size="3">
							<div align="right"><b class="productItemPVP">`+prod.pvp+`</b>€</div>						
						</ion-col>
					</ion-row>
				<ion-row >
					<ion-col>
						<i class="productDescription">`+prod.description+`
						</i>
					</ion-col>
				</ion-row>
				<ion-row >
					<ion-col>
						<div>
							<input class="productItemCantity" type="number" id="`+idInput+`" value="0" placeHolder="Cdad." min="0" max="10000000" id="points" name="points" step="1" disabled>
						</div>
						<ion-button color="vibrant" onclick="decrement('`+idInput+`')">
							<ion-icon slot="icon-only" name="remove-circle-outline">
							</ion-icon>
						</ion-button>
						<ion-button color="vibrant" onclick="increment('`+idInput+`')">
							<ion-icon slot="icon-only" name="add-circle-outline">
							</ion-icon>
						</ion-button>
					</ion-col>
					<ion-col><div align="right">`;

					if(prod.hasOwnProperty("alergenos") && prod.alergenos.length){
						var alerg = prod.alergenos.toString();
						alerg = alerg.replace(/,/g,'|');

						product = product + `<ion-button onclick="showAllergen('`+prod.title+`','`+alerg+`')" size="small" color="danger"">
						Alérgenos</ion-button>`;
					} ;
					product = product + `</div>
					</ion-col>
				</ion-row>
			</ion-grid>
			</ion-item>`;
			products = products + product;
		}
	});
	
	return products;
        
};

handleButtonClick = function () {
	if(!orderEnabled){
		presentToast("Este local no tiene activados los pedidos");    		
	} else if(numProductos === 0){
		presentToast("No ha seleccionado ningún producto");    		
	} else {
		//showOrderDetail();
		createModal();
	}
};

showAllergen = function (allergenProduct, allergens) {
	selectedAllergenProduct = allergenProduct;
	setSelectedAllergens(allergens.split("|"));
	const popover = Object.assign(document.createElement('ion-popover'), {
		component: 'popover-allergen-page',
		translucent: true
	  });
	  document.body.appendChild(popover);
	  return popover.present();
};

setSelectedAllergens = function (allergens){
	selectedAllergens = {};
	selectedAllergens.altramuces = "none";
	selectedAllergens.apio = "none";
	selectedAllergens.cacahuetes = "none";
	selectedAllergens.cascara = "none";
	selectedAllergens.crustaceos = "none";
	selectedAllergens.gluten = "none";
	selectedAllergens.huevos = "none";
	selectedAllergens.lacteos = "none";
	selectedAllergens.moluscos = "none";
	selectedAllergens.mostaza = "none";
	selectedAllergens.pescado = "none";
	selectedAllergens.sesamo = "none";
	selectedAllergens.soja = "none";
	selectedAllergens.sulfitos = "none";

	allergens.forEach(allergen=>{
		selectedAllergens[allergen] = "block";
	});
	

}
showOrderDetail = function () {
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

increment = function(id){
	numProductos = numProductos+1;
	document.getElementById(id).stepUp(1);
	updateBadge();
};

resetBadge = function(){
	numProductos = 0;
	updateBadge();
};

decrement = function(id){
	var inputValue = document.getElementById(id).value;
	if(inputValue==="0"){
		//
	} else {
		numProductos = numProductos-1;
		document.getElementById(id).stepDown(1);
		updateBadge();
	}

};

updateBadge = function () {
	var badgeContent;
	if(numProductos === 0){
		badgeContent = "";
	} else{
		badgeContent = numProductos;
    }
    var cartBadge = document.getElementById("cart-badge2");
    if(cartBadge !== null){
        cartBadge.innerHTML = badgeContent;
    }
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

hacerPedido = function () {
       
    var address = "Para recoger";
    var street = document.getElementById("streetId").value;
    if(isToHome){    	
    	address = street;
    }
	var cartaContent = document.getElementById("menuContent").children;
	var itemsPedido = Array.from(document.getElementsByClassName("carritoItem"));

	var pedido = "_Pedido_";
	pedido = pedido + "\r\n\r\n*Dirección de envío: "+address+"*";
	var empty = true;
	
	for(var i=0;i<itemsPedido.length;i++){
		var productName = itemsPedido[i].getElementsByClassName("lineaPedidoItem")[0].innerHTML;
		var indicaciones = itemsPedido[i].getElementsByClassName("indicacionesItem")[0].value;
		pedido = pedido + "\r\n\r\n"+"- "+productName+" _("+indicaciones+")_";			
	}
	
	var freeText = document.getElementById("freeText").value;
	pedido = pedido + "\r\n\r\n_"+freeText+"_";

	if(!isPickUp && !isToHome) {
		presentToast("Indique el modo de envío/recogida");    	
	}else if(isToHome && (street === "")) {
		presentToast("Indique una dirección de envío");    	
	} else {
		dismissModal();
		var encodedPedido = window.encodeURIComponent(pedido);
		window.open('whatsapp://send?text='+encodedPedido+'&phone='+propertyInfo.whatsapp+'&abid='+propertyInfo.whatsapp)
	}
}; 

getCurrentOrderInner = function () {
	var notPriceProduct = false;
	var cartaContent = document.getElementById("menuContent").children;
	var currentOrder = [];
	var total = 0;
	var innerHTML = `<ion-item>
        			<ion-label class="ion-text-wrap">[TAG_PVP]</ion-label>
     	 		</ion-item>`;

	for(var i=0;i<cartaContent.length;i++){
		if(cartaContent[i].tagName === "ION-LIST"){
			var productsContent = cartaContent[i].children;
			var carritoProductIndex = 0;
			for(var j=0;j<productsContent.length;j++){
				if(productsContent[j].tagName === "ION-ITEM"){
					var product = productsContent[j].children[0];
					var price = product.getElementsByClassName("productItemPVP")[0].innerText;
					var value = product.getElementsByClassName("productItemCantity")[0].value;
					var productName = product.getElementsByClassName("productItemTitle")[0].innerText;
					if(value === "" || value === "0"){
					} else {
					  empty = false;
					  currentOrder.push(value+" "+productName);
					  carritoProductIndex = carritoProductIndex + 1;
					  var numberPrice = Number(price.replace("€",""));
					  var numberValue = Number(value);
					  if(!isNaN(numberPrice)){
						total = total + (numberPrice*numberValue);
					  }	else{
						notPriceProduct = true;
					  }		  

					  var idProduct = "carritoProduct"+carritoProductIndex;


						  innerHTML = innerHTML + `<ion-item class="carritoItem"  id="`+idProduct+`">
						  <ion-grid>
								<ion-row>
								  <h4 class="lineaPedidoItem">`+value+" "+productName+`</h4>
							  	</ion-row>
							  	<ion-row>
							  		<ion-input class="indicacionesItem" placeholder="Indicaciones"></ion-input>
							  	</ion-row>
							</ion-grid>
						</ion-item>`;

					}	
					
				}
			}
		}
	}
	if(!notPriceProduct){
		innerHTML = innerHTML.replace("[TAG_PVP]","TOTAL: "+total+"€");
	} else {
		innerHTML = innerHTML.replace("[TAG_PVP]","TOTAL: "+total+"€ - No incluye todo el pedido. Consultar con el establecimiento");
	}
	return innerHTML;
	
}

function removeCarritoItem(id){
	document.getElementById(id).remove();
}

handleButtonInfoClick = async function handleButtonInfoClick(ev) {
      popover = await popoverController.create({
        component: 'popover-info-page',
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

 customElements.define('popover-info-page', class ModalContent extends HTMLElement {
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

	customElements.define('popover-allergen-page', class ModalContent extends HTMLElement {
		connectedCallback() {

		  var infoString = `<ion-list>
		  <ion-list-header>
			`+selectedAllergenProduct+`
		  </ion-list-header>
  
		  	<ion-item lines="none" style="display:`+selectedAllergens.altramuces+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/altramuces.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Altramuces</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.apio+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/apio.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Apio</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.cacahuetes+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/cacahuetes.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Cacahuetes</h3>
				</ion-label>
			  </ion-item>
				  
			  <ion-item lines="none" style="display:`+selectedAllergens.cascara+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/cascara.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Cáscara</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.crustaceos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/crustaceos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Crustaceos</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.gluten+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/gluten.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Gluten</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.huevos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/huevos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Huevos</h3>
				</ion-label>
			  </ion-item>

			  <ion-item lines="none" style="display:`+selectedAllergens.lacteos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/lacteos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Lácteos</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.moluscos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/moluscos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Moluscos</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.mostaza+`">
			  	<ion-avatar slot="start">
					<img src="./images/mostaza.png">
				</ion-avatar>
				<ion-label>
				  <h3>Mostaza</h3>
				</ion-label>
		  		</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.pescado+`">
					<ion-avatar slot="start">
						<img src="./images/pescado.png">
					</ion-avatar>
					<ion-label>
						<h3>Pescado</h3>
					</ion-label>
				</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.sesamo+`">
					<ion-avatar slot="start">
						<img src="./images/sesamo.png">
					</ion-avatar>
					<ion-label>
						<h3>Sésamo</h3>
					</ion-label>
				</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.soja+`">
					<ion-avatar slot="start">
						<img src="./images/soja.png">
					</ion-avatar>
					<ion-label>
						<h3>Soja</h3>
					</ion-label>
				</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.sulfitos+`">
					<ion-avatar slot="start">
						<img src="./images/sulfitos.png">
					</ion-avatar>
					<ion-label>
						<h3>Sulfittos</h3>
					</ion-label>
				</ion-item>
		  
		  </ion-list>`
		  this.innerHTML = infoString;
		}
	  });

//DATA

const fetchLocal = (local) => {
    return axios.get(API_PATH+local,{ crossdomain: true })
        .then(response => {
			if(isEmpty(response.data)){
				hideLoading();
				goToHome();		
			} else{
        		setPropertyInfo(local, response.data);	
        		fetchMenu(local);
			}
        })
        .catch(error => {
			hideLoading();
			goToHome();

		});
};

const fetchMenu = (local) => {
    return axios.get(API_PATH+local+"/menu",{ crossdomain: true })
        .then(response => {
			hideLoading();
			resetBadge();
			if(isEmpty(response.data)){
				hideLoading();
				//Toast no hay carta		
			} else{
        		setMenuInfo(response.data);	   
        		hideLoading();     				
			}
        })
        .catch(error => {
			hideLoading();
			goToHome();
		});
};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
};

function goToHome(){
	window.location.href = HOME;
};


    customElements.define('modal-content', class ModalContent extends HTMLElement {
      connectedCallback() {
      	var currentOrder = getCurrentOrderInner();
   
        this.innerHTML = `
          <ion-header translucent>
            <ion-toolbar color="dark">
              <ion-title>Mi Pedido</ion-title>
              <ion-buttons slot="end">
                <ion-button onclick="dismissModal()">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content fullscreen>
            <ion-list>
                 <ion-radio-group mode=md value="sendType" >
					<ion-item class="typeSendInput" onclick="pickUp()">
            			<ion-label >Recoger en el local</ion-label>
            			<ion-radio slot="start" color="vibrant" value="recoger"></ion-radio>
          			</ion-item>
					<ion-item class="typeSendInput" onclick="sendHome()">
            			<ion-label>Enviar a casa</ion-label>
            			<ion-radio slot="start" color="vibrant" value="enviar"></ion-radio>
          			</ion-item>
                  </ion-radio-group>
         		<form class="formAddressDisable" id="formAddress">
      				<ion-item>
        				<ion-label>Dirección</ion-label>
       			 		<ion-input type="text" id="streetId" name="title"></ion-input>
      				</ion-item>
    	  		</form>
				<ion-item>
  					<ion-textarea id="freeText" placeholder="Coméntanos lo que quieras"></ion-textarea>
				</ion-item>
				`+currentOrder+`</ion-list>
          </ion-content>
          <ion-footer>
		<div class="horizontal div1">
    		<div class="vertical">
        	<ion-button expand="block" onclick="hacerPedido()" color="vibrant">Pedir por Whatsapp</ion-button>
   			 </div>
		</div>

	</ion-footer>
        `;
      }
    });

var currentModal = null;

async function createModal() {
	const modal = await modalController.create({
	component: 'modal-content'
	});
	await modal.present();
	currentModal = modal;
};

function dismissModal() {
	if (currentModal) {
        currentModal.dismiss().then(() => { currentModal = null; });
	}
};

function sendHome(){
	isToHome =  true;
	isPickUp = false;
	document.getElementById("formAddress").className="formAddressEnable";
};

function pickUp(){
	isToHome =  false;
	isPickUp = true;
	document.getElementById("formAddress").className="formAddressDisable";
};


    function handleInputSearchBar(event) {
      var items = Array.from(document.getElementsByClassName("productItem"));

      var query = event.target.value.toLowerCase();
      requestAnimationFrame(() => {
        items.forEach(item => {
          var productLabel = item.children[0].children[0].textContent;
          var shouldShow = productLabel.toLowerCase().indexOf(query) > -1;
          item.style.display = shouldShow ? 'block' : 'none';
        });
      });
    }