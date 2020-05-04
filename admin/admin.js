var API_PATH_ADMIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";
var indexCategory = 10;
const LOGIN = "./login.html";

var jwtToken;
var localId;
var MENU_INFO = {};
var LOCAL_INFO = {};
var MAP_CATEGORIES_ID = new Map();
var nav;

window.onload = (e) => { 
	nav = document.querySelector('ion-nav');

	jwtToken = localStorage.getItem("jwt-token");
	if(jwtToken === null){
		goToLogin();
	} else {
		localId = localStorage.getItem("localId");
		selectConfiguration("local");  
		fetchLocal(localId);	
	} 
}

addNewCategory = function (id) {
    indexCategory = indexCategory + 1;
    var category = "category"+indexCategory;
	var value = document.getElementById(id).value;
	document.getElementById("newCategoryId").value="";

	var lastNode = document.getElementById("newCategoryItem");
	
	var elem = document.createElement('ion-item');
	elem.setAttribute("id", category);

	var categoryObject = {};
	categoryObject.title = value;
	categoryObject.products = [];
	MAP_CATEGORIES_ID.set(category, categoryObject);


    elem.innerHTML = `<ion-buttons slot="end">
        			<ion-button color="vibrant" onclick="removeCategory('`+category+`')">
      					<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
        			</ion-button>
        			<ion-button color="vibrant">        		
        				<ion-icon slot="icon-only"  name="heart-outline"></ion-icon>
  					</ion-button>
  					<ion-button color="vibrant" onclick="showCategoryDetail('`+category+`')">        		
        				<ion-icon slot="icon-only"  name="pencil-outline"></ion-icon>
  					</ion-button>
        		</ion-buttons>        		
          		<ion-input value="`+value+`" class="ion-text-wrap">
          		</ion-input>`;
    document.getElementById("listCategories").insertBefore(elem,lastNode);

};

removeCategory = function (id) {
	var lastNode = document.getElementById(id).remove();
	MAP_CATEGORIES_ID.delete(id);
};  

//

selectConfiguration = function (idConfiguration) {
	if(idConfiguration === "local"){
		document.getElementById("local").style.display="block";
		document.getElementById("carta").style.display="none";	
		document.getElementById("code").style.display="none";		
		document.getElementById("mainTitle").innerHTML="Configurar local";	
	} else if(idConfiguration === "carta"){
		document.getElementById("local").style.display="none";
		document.getElementById("carta").style.display="block";
		document.getElementById("code").style.display="none";		
		document.getElementById("mainTitle").innerHTML="Configurar carta";	
		fetchMenu(localId);		
	} else if(idConfiguration === "code"){
		document.getElementById("local").style.display="none";
		document.getElementById("carta").style.display="none";
		document.getElementById("code").style.display="block";		
		document.getElementById("mainTitle").innerHTML="Generar código";			
	} else if(idConfiguration === "exit"){
		goToLogin();		
	}
	closeMenu();

};

async function closeMenu() {
      await menuController.close();
    }

function goToLogin(){
	localStorage.removeItem("jwt-token");
	window.location.href = LOGIN;
}

function setLocalInfo(localInfo){
	LOCAL_INFO = localInfo;
	document.getElementById("id").value = localInfo.id;
	document.getElementById("propertyName").value = localInfo.propertyName;
	document.getElementById("shortName").value = localInfo.shortName;
	document.getElementById("latitude").value = localInfo.latitude;
	document.getElementById("longitude").value = localInfo.longitude;
	document.getElementById("description").value = localInfo.description;
	document.getElementById("phoneNumber").value = localInfo.phoneNumber;
	document.getElementById("whatsapp").value = localInfo.whatsapp;
	document.getElementById("timeTable").value = localInfo.timeTable;
	document.getElementById("card").checked = localInfo.card;
	document.getElementById("cash").checked = localInfo.cash;
	document.getElementById("homeDelivery").checked = localInfo.homeDelivery;	
}

function setMenuInfo(menuInfo){
	MAP_CATEGORIES_ID = new Map();
	MENU_INFO = menuInfo;
	customElements.define('nav-categories', class NavHome extends HTMLElement {
		connectedCallback() {
		  var categoryHTML = "";

		  categoryHTML = `
			<ion-header translucent>
			  <ion-toolbar>
				<ion-title>Categorías</ion-title>
			  </ion-toolbar>
			</ion-header>
			<ion-content fullscreen>
			  <ion-list id="listCategories">`;
			  
			  menuInfo[0].categories.forEach(category=>{
				indexCategory = indexCategory +1;
				var idCategory = "category"+indexCategory;
				MAP_CATEGORIES_ID.set(idCategory,category);
				categoryHTML = categoryHTML + `<ion-item id="`+idCategory+`">
				<ion-buttons slot="end">
				  <ion-button color="vibrant" onclick="removeCategory('`+idCategory+`')" >
						<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
				  </ion-button>
				  <ion-button color="vibrant">        		
					  <ion-icon slot="icon-only"  name="heart-outline"></ion-icon>
					</ion-button>
					<ion-button color="vibrant" onclick="showCategoryDetail('`+idCategory+`')">        		
					  <ion-icon slot="icon-only"  name="pencil-outline"></ion-icon>
					</ion-button>
			  </ion-buttons>
		
				<ion-input value="`+category.title+`" class="ion-text-wrap">
				</ion-input>
		  </ion-item>`;
			});
			categoryHTML = categoryHTML + `<ion-item id="newCategoryItem">
			<ion-button color="vibrant" onclick="addNewCategory('newCategoryId')" slot="end">
				Añadir
			  </ion-button>          		
				<ion-input id="newCategoryId" value="" placeholder="Escriba nombre de la categoría" class="ion-text-wrap">
				</ion-input>
			</ion-item>`;
			categoryHTML = categoryHTML+  `</ion-list>
			</ion-content>
		  `;
		  this.innerHTML = categoryHTML;
		  console.info(categoryHTML);
		}
	  });
	
};

customElements.define('nav-products', class NavDetail extends HTMLElement {
	connectedCallback() {
	  this.innerHTML = `
		<ion-header translucent>
		  <ion-toolbar>
			<ion-buttons slot="start">
			  <ion-back-button defaultHref="/"></ion-back-button>
			</ion-buttons>
			<ion-title>`+this.categoryProduct.title+`</ion-title>
		  </ion-toolbar>
		</ion-header>
		<ion-content fullscreen class="ion-padding">
		</ion-content>
	  `;
	}
  });

function showCategoryDetail(category) {
	const categoryProduct = MAP_CATEGORIES_ID.get(category);
	nav.push('nav-products', {categoryProduct});
};

function saveLocalInfo(){
	showLoading("Guardando datos del local");
	var localInfo = {};
	localInfo.id = document.getElementById("id").value;
	localInfo.propertyName = document.getElementById("propertyName").value;
	localInfo.shortName = document.getElementById("shortName").value;
	localInfo.latitude = document.getElementById("latitude").value;
	localInfo.longitude = document.getElementById("longitude").value;
	localInfo.description = document.getElementById("description").value;
	localInfo.phoneNumber = document.getElementById("phoneNumber").value;
	localInfo.whatsapp = document.getElementById("whatsapp").value;
	localInfo.timeTable = document.getElementById("timeTable").value;
	localInfo.card = document.getElementById("card").checked;
	localInfo.cash = document.getElementById("cash").checked;
	localInfo.homeDelivery = document.getElementById("homeDelivery").checked;	
	LOCAL_INFO = localInfo;
	sendLocalInfo(localId, localInfo);
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
function presentToast(text) {
  const toast = document.createElement('ion-toast');
  toast.message = text;
  toast.duration = 3000;

  document.body.appendChild(toast);
  return toast.present();
}

//DATA

const fetchLocal = (idLocal) => {
	showLoading("Obteniendo información del local"); 
    return axios.get(API_PATH_ADMIN+"/local/"+idLocal,{ crossdomain: true })
        .then(response => {
        	setLocalInfo(response.data);
        	hideLoading();
        })
        .catch(error => {
        	hideLoading();
        	goToLogin();
        });
};

const fetchMenu = (idLocal) => {
	showLoading("Obteniendo el menú"); 
    return axios.get(API_PATH_ADMIN+"/local/"+idLocal+"/menu",{ crossdomain: true })
        .then(response => {
        	setMenuInfo(response.data);
        	hideLoading();
        })
        .catch(error => {
        	hideLoading();
        	goToLogin();
        });
};


const sendLocalInfo = (idLocal, localPostData) => {

	var url = API_PATH_ADMIN+"/local/"+idLocal+"?access_token="+jwtToken;
	var json = JSON.stringify(localPostData);

	var xhr = new XMLHttpRequest();
	xhr.open("PUT", url, true);
	xhr.setRequestHeader('Content-type','application/json');
	xhr.onload = function () {
	if (xhr.readyState == 4 && xhr.status == "200") {
	    hideLoading();
	    presentToast("Datos guardados correctamente");
	} else if(xhr.status == "403"){
		hideLoading();
		goToLogin();
	}else {
		fetchLocal(idLocal);
	}
}
	xhr.send(json);
};


