const MENU = "./menu.html"
const MENU_BASE_URL = "https://www.ilovemenu.es/menu/menu.html";
const SERVICE_WORKER = '/menu/service-worker.js';
const API_PATH = "https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/";
//const API_PATH = "http://localhost:8080/api/guanmor/1.0.0/local/";

var localId;
var propertyInfo;
var clientAddress;

var loading;
var searchBar;
let deferredPrompt;
var zipCode = "";

window.onload = (e) => { 
	window.addEventListener('beforeinstallprompt', (e) => {
		deferredPrompt = e;
	});
  
	
	searchbar = document.querySelector('ion-searchbar');
    searchbar.addEventListener('ionInput', handleInputSearchBar);
	//zipCode = GetURLParameter("zipCode");
	
	//showLoading("Cargando cartas de restaurantes");
    getFavoritesInfo();
}

function showPosition(position) {
	var urlZipCode = "https://ezcmd.com/apps/api_geo_postal_codes/nearby_locations_by_coords/GUEST_USER/-1?within=1&coords="+position.coords.latitude+","+position.coords.longitude;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       // Typical action to be performed when the document is ready:
	   console.info(xhttp.responseText);
	   zipCode = JSON.parse(xhttp.responseText).search_results[0].postal_code;
	   	if(zipCode!==""){
			showLoading("Buscando cartas de restaurantes");
    		getLocalesInfo(zipCode);
		}
    }
	};
	xhttp.open("GET", urlZipCode, true);
	xhttp.send();

}

GetURLParameter = function (sParam) {
	var code = "";
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++){
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam){
			code = sParameterName[1];
			code = code.replace("%3D","");
		}
	}
	return code;
};  
getLocalesInfo = function (query) {
	fetchLocales(query);
}; 

getFavoritesInfo = function () {
	let favoritesInfo = [];
	let mapFavorites;
	if(localStorage.getItem("local-favorites")=== null){
		favoritesInfo = [];
	} else {
		mapFavorites = JSON.parse(localStorage.getItem("local-favorites"));
		favoritesInfo = Object.values(mapFavorites);
	}

	setFavoritesInfo(favoritesInfo);	
}; 

setLocalesInfo = function (locales){

	var inner = "";
	var listLocales = document.getElementById("propertiesList");
	if(locales.length>0){

		inner = `<ion-list><ion-list-header>Cartas disponibles</ion-list-header>`;
	
		locales.forEach(local => {
			inner = inner + `<ion-list><ion-item >
			<ion-icon name="restaurant-outline" slot="start"></ion-icon>
			<ion-label onclick="goToCarta('`+local.id+`')">
				<h2>`+local.propertyName+`</h2>
				<p>`+local.description+`</p>
			</ion-label>
			</ion-item>`;
		});
		inner = inner + `</ion-list>`;	
		listLocales.innerHTML = inner;
	} else {
		inner = inner + `<div style="height:100%;weight:100%;display:flex; justify-content:center; align-items:center;text-align: center;"><h4 style="padding:10px;">No tienes cartas cerca de tu ubicación</h4></div>`;	
		listLocales.innerHTML = inner;
	}


};

setFavoritesInfo= function (locales){
	var inner = "";
	var listLocales = document.getElementById("favoritesList");
	if(locales.length>0){

		inner = `<ion-list><ion-list-header>Mis cartas favoritas</ion-list-header>`;
	
		locales.forEach(local => {
			let parsedLocal = JSON.parse(local);
			inner = inner + `<ion-list><ion-item >
			<ion-icon name="restaurant-outline" slot="start"></ion-icon>
			<ion-label onclick="goToCarta('`+parsedLocal.id+`')">
				<h2>`+parsedLocal.propertyName+`</h2>
				<p>`+parsedLocal.description+`</p>
			</ion-label>
			<ion-buttons slot="end">
			<ion-button id="backButton" onclick="removeLocal('`+parsedLocal.id+`')">
				  <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
			</ion-button>

		</ion-buttons>

			</ion-item>`;
		});
		inner = inner + `</ion-list>`;	
		listLocales.innerHTML = inner;
	} else {
		inner = inner + `<div style="height:100%;weight:100%;display:flex; justify-content:center; align-items:center;text-align: center;"><h4 style="padding:10px;">No tienes cartas añadidas a favoritos</h4></div>`;	
		listLocales.innerHTML = inner;
	}

};

removeLocal = async function (id) {
	var nombreLocal;
	var mapMenu = JSON.parse(localStorage.getItem("local-menus"));
	var mapFavorites = JSON.parse(localStorage.getItem("local-favorites"));
	nombreLocal = JSON.parse(mapFavorites[id]).propertyName;
	var alert = await alertController.create({
	  header: '¿Quieres eliminar la carta de '+nombreLocal+" de favoritos?",
	  message: 'Si eliminas no te aparecerá en favoritos',
	  buttons: [
		{
		  text: 'Cancelar',
		  role: 'cancel',
		  handler: () => {
			console.log('Cancel clicked');
		  }
		},
		{
		  text: 'Aceptar',
		  handler: () => {
			delete mapFavorites[id];
			localStorage.setItem("local-favorites",JSON.stringify(mapFavorites));
			//Borrar carta también
			getFavoritesInfo();
		  }
		}
	  ]
	});

	await alert.present();

};  

showLoading = function (text) {
	loading = document.createElement('ion-loading');
  	loading.message = text;
  	document.body.appendChild(loading);
    loading.present();
}
hideLoading = function () {
	loading.dismiss();
}

//DATA

const fetchLocales = (zipCode) => {
    return axios.get(API_PATH+"?zipCode="+zipCode,{ crossdomain: true })
        .then(response => {
			hideLoading();
			setLocalesInfo(response.data);	
			
        })
        .catch(error => {
			hideLoading();
        });
};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function goToCarta(idLocal){
	window.location.href = MENU+"?property="+window.btoa(idLocal);
}


function handleInputSearchBar(event) {
	var query = event.target.value.toLowerCase();
	if(query.length === 5){
		showLoading("Buscando cartas de restaurantes");
    	getLocalesInfo(query);
	} else if(query.length === 0){
		showLoading("Buscando cartas de restaurantes");
    	getLocalesInfo(zipCode);
	}
}

/*function onQRCodeScanned(scannedText)
{
	window.location.href = scannedText;
}

//this function will be called when JsQRScanner is ready to use
function JsQRScannerReady()
{
	//create a new scanner passing to it a callback function that will be invoked when
	//the scanner succesfully scan a QR code
	var jbScanner = new JsQRScanner(onQRCodeScanned);
	//reduce the size of analyzed images to increase performance on mobile devices
	jbScanner.setSnapImageMaxSize(300);
	var scannerParentElement = document.getElementById("scanner");
	if(scannerParentElement)
	{
		//append the jbScanner to an existing DOM element
		jbScanner.appendTo(scannerParentElement);
	}        
}*/
