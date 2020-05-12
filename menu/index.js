const MENU = "./menu.html"
const MENU_BASE_URL = "https://www.ilovemenu.es/menu/menu.html";
const SERVICE_WORKER = '/menu/service-worker.js';
const API_PATH = "https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/";

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
    //getLocalesInfo();
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