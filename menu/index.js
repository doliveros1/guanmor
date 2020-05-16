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

window.onload = (e) => { 
	window.addEventListener('beforeinstallprompt', (e) => {
		deferredPrompt = e;
	});
	
	searchbar = document.querySelector('ion-searchbar');
    searchbar.addEventListener('ionInput', handleInputSearchBar);
	var zipCode = GetURLParameter("zipCode");
	if(zipCode!==""){
		showLoading("Buscando cartas de restaurantes");
    	getLocalesInfo(zipCode);
	}
	//showLoading("Cargando cartas de restaurantes");
    getFavoritesInfo();
}

GetURLParameter = function (sParam) {
	var code = "45880";
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

	var listLocales = document.getElementById("propertiesList");
	var inner = `<ion-list><ion-list-header>Restaurantes con carta</ion-list-header>`;
	
	locales.forEach(local => {
		inner = inner + `<ion-list><ion-item onclick="goToCarta('`+local.id+`')">
          <ion-icon name="restaurant-outline" slot="start"></ion-icon>
          <ion-label>
            <h2>`+local.propertyName+`</h2>
            <p>`+local.description+`</p>
          </ion-label>
        </ion-item>`;
	});
	inner = inner + `</ion-list>`;
	
	listLocales.innerHTML = inner;

};

setFavoritesInfo= function (locales){

	var listLocales = document.getElementById("favoritesList");
	var inner = `<ion-list><ion-list-header>Mis cartas favoritas</ion-list-header>`;
	
	locales.forEach(local => {
		let parsedLocal = JSON.parse(local);
		inner = inner + `<ion-list><ion-item >
          <ion-icon name="restaurant-outline" slot="start"></ion-icon>
          <ion-label onclick="goToCarta('`+parsedLocal.id+`')">
            <h2>`+parsedLocal.propertyName+`</h2>
            <p>`+parsedLocal.description+`</p>
		  </ion-label>
		  <ion-button onclick="removeLocal('`+parsedLocal.id+`')" color="dark">
		  <ion-icon name="trash-outline" slot="end"></ion-icon>
		  </ion-button>
        </ion-item>`;
	});
	inner = inner + `</ion-list>`;	
	listLocales.innerHTML = inner;

};

removeLocal = async function (id) {
	var nombreLocal;
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
    	getLocalesInfo(query);
	}
}