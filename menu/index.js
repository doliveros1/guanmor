const MENU = "./menu.html"
const MENU_BASE_URL = "https://www.ilovemenu.es/menu/menu.html";
const SERVICE_WORKER = '/menu/service-worker.js';
const API_PATH = "https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/";

var localId;
var propertyInfo;
var clientAddress;

var loading;


let deferredPrompt;

window.onload = (e) => { 
	window.addEventListener('beforeinstallprompt', (e) => {
		deferredPrompt = e;
    });
    showLoading("Cargando cartas de restaurantes");
    getLocalesInfo();
}

getLocalesInfo = function () {
	fetchLocales();
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

const fetchLocales = () => {
    return axios.get(API_PATH,{ crossdomain: true })
        .then(response => {
			hideLoading();
			if(isEmpty(response.data)){
				alert("No hay bares");		
			} else{
        		setLocalesInfo(response.data);			
			}
        })
        .catch(error => {
			hideLoading();
        });
};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function goToCarta(idLocal){
	window.location.href = MENU+"?property="+idLocal;
}
