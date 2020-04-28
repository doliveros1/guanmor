const SEND_WHATSAPP = "";
const CALL_PHONE = "";
const SHARE_WHATSAPP = "";
const MENU_BASE_URL = "https://doliveros1.github.io/guanmor/menu.html";
const API_PATH = "https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/";
const MENU = "./menu.html"

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
    //alert(locales);
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
    return axios.get(API_PATH)
        .then(response => {
			hideLoading();
			if(isEmpty(response.data)){
				alert("No hay bares");		
			} else{
        		setLocalesInfo(response.data);			
			}
        })
        .catch(error => console.error(error));
};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function goToCarta(idLocal){
	window.location.href = MENU+"?property="+idLocal;
}
