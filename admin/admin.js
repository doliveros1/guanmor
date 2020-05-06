var API_PATH_ADMIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";
var indexCategory = 0;
var indexProduct = 0;

const LOGIN = "./login.html";

var jwtToken;
var localId;
var MENU_INFO = {};
var LOCAL_INFO = {};
var MAP_CATEGORIES_ID = new Map();
var MAP_PRODUCTS_ID = new Map();
var nav;

var page;

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
	if(value === ""){
		presentToast("El nombre de la categoría no puede estar vacía");
	} else {
	document.getElementById("newCategoryId").value="";

	var lastNode = document.getElementById("newCategoryItem");
	
	var elem = document.createElement('ion-item');
	elem.setAttribute("id", category);

	var categoryObject = {};
	categoryObject.title = value;
	categoryObject.products = [];
	categoryObject.enable = true;
	MAP_CATEGORIES_ID.set(category, categoryObject);

    elem.innerHTML = `<div slot="end">
        			<ion-button color="vibrant" onclick="removeCategory('`+category+`')">
      					<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
        			</ion-button>
					<ion-button color="vibrant" onclick="checkEnableCategory('`+category+`')" >        		
						<ion-icon class="inputEnableCategory" slot="icon-only"  name="heart-outline"></ion-icon>
  					</ion-button>
  					<ion-button color="vibrant" onclick="showCategoryDetail('`+category+`')">        		
        				<ion-icon slot="icon-only"  name="pencil-outline"></ion-icon>
  					</ion-button>
        		</div>        		
          		<ion-textarea value="`+value+`" class="ion-text-wrap">
          		</ion-textarea>`;
    document.getElementById("listCategories").insertBefore(elem,lastNode);		
	}
};

addNewProduct= function (idCategory, idProduct) {
    indexProduct = indexProduct + 1;
    var product = "product"+indexProduct;
	var valueTitle = document.getElementById(idProduct).getElementsByClassName("inputProductTitle")[0].value;
	var valueDescription = document.getElementById(idProduct).getElementsByClassName("inputProductDescription")[0].value;
	var valuePvp= document.getElementById(idProduct).getElementsByClassName("inputProductPvp")[0].value;

	if(valueTitle === ""){
		presentToast("El nombre del producto no puede estar vacío");
	}else {
	document.getElementById("newProductTitleId").value="";
	document.getElementById("newProductDescriptionId").value="";
	document.getElementById("newProductPvpId").value="";

	var lastNode = document.getElementById("newProductItem");
	
	var elem = document.createElement('ion-item');
	elem.setAttribute("id", product);

	var productObject = {};
	productObject.title = valueTitle;
	productObject.description =valueDescription;
	productObject.pvp = valuePvp;
	productObject.enable = true;

	MAP_CATEGORIES_ID.get(idCategory).products.push(productObject);
	MAP_PRODUCTS_ID.set(product, productObject);

	elem.innerHTML = `
	<ion-grid>
		<ion-row>
			<ion-col>
				<ion-item class="productItem" >
					<ion-label position="stacked"  color="vibrant" >Título</ion-label>
					<ion-textarea onfocusout="updateProduct('`+idCategory+`','`+idProduct+`')" value="`+productObject.title+`" class="ion-text-wrap inputProductTitle">
				</ion-item>
			</ion-col>
		</ion-row>
		<ion-row>
			<ion-col>
				<ion-item class="productItem" >
					<ion-label position="stacked" color="vibrant" >Descripción</ion-label>
					<ion-textarea onfocusout="updateProduct('`+idCategory+`','`+idProduct+`')" value="`+productObject.description+`" class="ion-text-wrap inputProductDescription">
				</ion-item>
			</ion-col>
		</ion-row>
		<ion-row>
			<ion-col>
				<ion-item class="productItem" >
					<ion-label position="stacked"  color="vibrant">Precio</ion-label>
					<ion-textarea onfocusout="updateProduct('`+idCategory+`','`+idProduct+`')" value="`+productObject.pvp+`" class="ion-text-wrap inputProductPvp">
				</ion-item>
			</ion-col>
			<ion-col>
				<div align="right">
				<ion-button color="vibrant" onclick="removeProduct('`+idCategory+`','`+product+`')" >
				<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
				  </ion-button>
				  <ion-button color="vibrant" onclick="checkEnableProduct('`+idCategory+`','`+product+`')" >        		
				  <ion-icon class="inputEnableProduct" slot="icon-only"  name="heart-outline"></ion-icon>
					</ion-button>
				</div>
			</ion-col>
		</ion-row>
	</ion-grid>
	`;

				 /* elem.innerHTML = `
				  <ion-col>
					<ion-list inset>
					  <ion-item>
						  <ion-label position="stacked"  color="vibrant" >Título</ion-label>
						  <ion-textarea onfocusout="updateProduct('`+idCategory+`','`+idProduct+`')" value="`+productObject.title+`" class="ion-text-wrap inputProductTitle">
						  </ion-item>
						<ion-item>
						  <ion-label position="stacked" color="vibrant" >Descripción</ion-label>
						  <ion-textarea onfocusout="updateProduct('`+idCategory+`','`+idProduct+`')" value="`+productObject.description+`" class="ion-text-wrap inputProductDescription">
						</ion-item>
						<ion-item>
						  <ion-label position="stacked"  color="vibrant">Precio</ion-label>
						  <ion-textarea onfocusout="updateProduct('`+idCategory+`','`+idProduct+`')" value="`+productObject.pvp+`" class="ion-text-wrap inputProductPvp">
						</ion-item>
					</ion-list>
				  </ion-col>
				</ion-row>
				<ion-buttons slot="end">
				<ion-button color="vibrant" onclick="removeProduct('`+idCategory+`','`+product+`')" >
				<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
				  </ion-button>
				  <ion-button color="vibrant" onclick="checkEnableProduct('`+idCategory+`','`+product+`')" >        		
				  <ion-icon class="inputEnableProduct" slot="icon-only"  name="heart-outline"></ion-icon>
					</ion-button>
			  </ion-buttons>  
			 `;*/
				  
	document.getElementById("listProducts").insertBefore(elem,lastNode);

	}

};

removeCategory = async function (id) {
		var alert = await alertController.create({
		  header: '¿Quieres eliminar el elemento '+MAP_CATEGORIES_ID.get(id).title+"?",
		  message: 'Si eliminas no podrás recuperarlo',
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
				document.getElementById(id).remove();
				MAP_CATEGORIES_ID.delete(id);
			  }
			}
		  ]
		});
	
		await alert.present();

};  
updateCategory = function (idCategory) {
	var valueTitle = document.getElementById(idCategory).getElementsByClassName("inputCategoryTitle")[0].value;
	var category = MAP_CATEGORIES_ID.get(idCategory);
	category.title = valueTitle;
	
};  
checkEnableCategory = function (idCategory) {
	var inputEnable = document.getElementById(idCategory).getElementsByClassName("inputEnableCategory");
	var enable;
	if(inputEnable[0].name === "heart-dislike-outline"){
		enable = true;
		inputEnable[0].name = "heart-outline";
	} else if(inputEnable[0].name === "heart-outline"){
		enable = false;
		inputEnable[0].name = "heart-dislike-outline";
	}
	var category = MAP_CATEGORIES_ID.get(idCategory);
	category.enable = enable;
};  

removeProduct = async function (idCategory, idProduct) {
	var alert = await alertController.create({
		header: '¿Quieres eliminar el elemento '+MAP_PRODUCTS_ID.get(idProduct).title+"?",
		message: 'Si eliminas no podrás recuperarlo',
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
				document.getElementById(idProduct).remove();
				var products = MAP_CATEGORIES_ID.get(idCategory).products;
				var product = MAP_PRODUCTS_ID.get(idProduct);
				products = products.filter(item => item.title !== product.title);
				MAP_CATEGORIES_ID.get(idCategory).products = products;
			}
		  }
		]
	  });
  
	  await alert.present();

};  
updateProduct = function (idCategory, idProduct) {
	var valueTitle = document.getElementById(idProduct).getElementsByClassName("inputProductTitle")[0].value;
	var valueDescription = document.getElementById(idProduct).getElementsByClassName("inputProductDescription")[0].value;
	var valuePvp= document.getElementById(idProduct).getElementsByClassName("inputProductPvp")[0].value;
	var product = MAP_PRODUCTS_ID.get(idProduct);
	product.title = valueTitle;
	product.description = valueDescription;
	product.pvp = valuePvp;
};  

checkEnableProduct = function (idCategory, idProduct) {
	var inputEnable = document.getElementById(idProduct).getElementsByClassName("inputEnableProduct");
	var enable;
	if(inputEnable[0].name === "heart-dislike-outline"){
		enable = true;
		inputEnable[0].name = "heart-outline";
	} else if(inputEnable[0].name === "heart-outline"){
		enable = false;
		inputEnable[0].name = "heart-dislike-outline";
	}
	var product = MAP_PRODUCTS_ID.get(idProduct);
	product.enable = enable;
}; 


selectConfiguration = function (idConfiguration) {
	page = idConfiguration;
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
		document.getElementById("mainTitle").innerHTML="Comparte tu carta";	
		document.getElementById("linkCarta").value = "https://www.ilovemenu.es/menu/menu.html?property="+localId;
	} else if(idConfiguration === "exit"){
		goToLogin();		
	}
	closeMenu();

};

copyLink = function () {
	 /* Get the text field */
	 var copyText = document.getElementById("linkCarta");

	 /* Select the text field */
	 copyText.select();
	 copyText.setSelectionRange(0, 99999); /*For mobile devices*/
   
	 /* Copy the text inside the text field */
	 document.execCommand("copy");
	 presentToast("Enlace copiado");

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
	document.getElementById("locationTitle").innerHTML = localInfo.propertyName;
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
	var categoryHTML = "";
	MENU_INFO = menuInfo;
	document.getElementById("idSugerencias").value = menuInfo[0].sugerencias;
	document.getElementById("idNota").value = menuInfo[0].nota;
	var listCategories = document.getElementById("listCategories");
	var iconHeart="";
	menuInfo[0].categories.forEach(category=>{
		indexCategory = indexCategory +1;
		var idCategory = "category"+indexCategory;
		MAP_CATEGORIES_ID.set(idCategory,category);
		if(category.enable){
			iconHeart = "heart-outline";
		} else{
			iconHeart = "heart-dislike-outline";
		}
		categoryHTML = categoryHTML + `<ion-item id="`+idCategory+`">
		<div slot="end">
		  <ion-button color="vibrant" onclick="removeCategory('`+idCategory+`')" >
				<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
		  </ion-button>
		  <ion-button color="vibrant" onclick="checkEnableCategory('`+idCategory+`')" >        		
			  <ion-icon class="inputEnableCategory" slot="icon-only" name="`+iconHeart+`"></ion-icon>
			</ion-button>
			<ion-button color="vibrant" onclick="showCategoryDetail('`+idCategory+`')">        		
			  <ion-icon slot="icon-only"  name="pencil-outline"></ion-icon>
			</ion-button>
	  </div>

		<ion-textarea onfocusout="updateCategory('`+idCategory+`')" value="`+category.title+`" class="ion-text-wrap inputCategoryTitle">
		</ion-textarea>
  </ion-item>`;
	});
	categoryHTML = categoryHTML + `<ion-item id="newCategoryItem">
	<ion-button color="vibrant" onclick="addNewCategory('newCategoryId')" slot="end">
		Añadir
	  </ion-button>          		
		<ion-textarea id="newCategoryId" value="" placeholder="Escriba nombre de la categoría" class="ion-text-wrap">
		</ion-textarea>
	</ion-item>`;
	listCategories.innerHTML = categoryHTML;	
};

customElements.define('nav-categories', class NavHome extends HTMLElement {
	connectedCallback() {
	  var categoryHTML = "";

	  categoryHTML = `
	  <ion-content fullscreen>
		
		<ion-header translucent>
		  <ion-toolbar color="vibrant">
			<ion-title>Categorías</ion-title>
		  </ion-toolbar>
		</ion-header>
		  <ion-list id="listCategories"></ion-list>	  
		  
		  <ion-list>
		  <ion-list-header color="vibrant">
		  <ion-title>Sugerencias y nota</ion-title>       
		   </ion-list-header>
			<ion-item>
				<ion-label color="vibrant" position="floating">Sugerencias</ion-label>
				<ion-textarea id="idSugerencias" color="dark"></ion-textarea>
				</ion-item>
			<ion-item>
		  <ion-label color="vibrant" position="floating">Nota</ion-label>
			 <ion-textarea id="idNota" color="dark"></ion-textarea>
			</ion-item>
		</ion-list>
		</ion-content>
	  `;
	  this.innerHTML = categoryHTML;
	  console.info(categoryHTML);
	}
  });

customElements.define('nav-products', class NavDetail extends HTMLElement {
	connectedCallback() {
	  MAP_PRODUCTS_ID = new Map();

	  var productHTML = "";
	  productHTML = productHTML +  `
		<ion-header translucent>
		  <ion-toolbar color="vibrant">
			<ion-buttons slot="start">
			  <ion-back-button defaultHref="/"></ion-back-button>
			</ion-buttons>
			<ion-title>`+this.categoryProduct.value.title+`</ion-title>
		  </ion-toolbar>
		</ion-header>
		<ion-content fullscreen class="ion-padding">
		<ion-list id="listProducts">
	  `;
	  this.categoryProduct.value.products.forEach(product=>{
		var iconHeart;
		if(product.enable){
			iconHeart = "heart-outline";
		} else{
			iconHeart = "heart-dislike-outline";
		}
		indexProduct = indexProduct +1;
		var idProduct = "product"+indexProduct;
		MAP_PRODUCTS_ID.set(idProduct, product);
		productHTML = productHTML + `<ion-item id="`+idProduct+`">

		<ion-grid>
        <ion-row>
          <ion-col>
			<ion-item class="productItem" >
				<ion-label position="stacked"  color="vibrant" >Título</ion-label>
				<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.title+`" class="ion-text-wrap inputProductTitle">
			</ion-item>
          </ion-col>          
		</ion-row>
		<ion-row>
		<ion-col>
		<ion-item class="productItem" >
			<ion-label position="stacked" color="vibrant" >Descripción</ion-label>
			<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.description+`" class="ion-text-wrap inputProductDescription">
	  	</ion-item>
		</ion-col>          
	  </ion-row>
	  <ion-row>
          <ion-col>
			<ion-item class="productItem" >
				<ion-label position="stacked"  color="vibrant">Precio</ion-label>
				<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.pvp+`" class="ion-text-wrap inputProductPvp">
			</ion-item>
		  </ion-col> 
		  <ion-col>
		  <div align="right">
			<ion-button color="vibrant" onclick="removeProduct('`+this.categoryProduct.id+`','`+idProduct+`')" >
			<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
				</ion-button>
				<ion-button color="vibrant" onclick="checkEnableProduct('`+this.categoryProduct.id+`','`+idProduct+`')" >        		
				<ion-icon class="inputEnableProduct" slot="icon-only"  name="`+iconHeart+`"></ion-icon>
				</ion-button>
			</div>
          </ion-col>          
		</ion-row>
		</ion-grid></ion-item>`;


		/*`<ion-col>
		  <ion-list inset>
			<ion-item>
				<ion-label position="stacked"  color="vibrant" >Título</ion-label>
				<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.title+`" class="ion-text-wrap inputProductTitle">
				</ion-item>
			  <ion-item>
				<ion-label position="stacked" color="vibrant" >Descripción</ion-label>
				<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.description+`" class="ion-text-wrap inputProductDescription">
			  </ion-item>
			  <ion-item>
				<ion-label position="stacked"  color="vibrant">Precio</ion-label>
				<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.pvp+`" class="ion-text-wrap inputProductPvp">
			  </ion-item>
		  </ion-list>
		</ion-col>
	  </ion-row>
	  <ion-buttons slot="end">
	  <ion-button color="vibrant" onclick="removeProduct('`+this.categoryProduct.id+`','`+idProduct+`')" >
	  <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
		</ion-button>
		<ion-button color="vibrant" onclick="checkEnableProduct('`+this.categoryProduct.id+`','`+idProduct+`')" >        		
		<ion-icon class="inputEnableProduct" slot="icon-only"  name="`+iconHeart+`"></ion-icon>
		  </ion-button>
	</ion-buttons>  
	</ion-item>`;*/
		/*productHTML = productHTML + `<ion-item id="`+idProduct+`">
		<ion-buttons slot="end">
		  <ion-button color="vibrant" onclick="removeProduct('`+this.categoryProduct.id+`','`+idProduct+`')" >
				<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
		  </ion-button>
		  <ion-button color="vibrant">        		
			  <ion-icon slot="icon-only"  name="heart-outline"></ion-icon>
			</ion-button>
	  </ion-buttons>

		<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.title+`" class="ion-text-wrap inputProductTitle">
		</ion-textarea>
  </ion-item>`;*/


	  });

	  productHTML = productHTML + `		<ion-item id="newProductItem">
	  <ion-col>
		<ion-list inset>
		  <ion-item>
			  <ion-label position="stacked"  color="vibrant" >Título</ion-label>
			  <ion-textarea id="newProductTitleId" value=""  class="ion-text-wrap inputProductTitle">
		  </ion-textarea>
			</ion-item>
			<ion-item>
			  <ion-label position="stacked" color="vibrant" >Descripción</ion-label>
			  <ion-textarea id="newProductDescriptionId" value=""  class="ion-text-wrap inputProductDescription">
			</ion-item>
			<ion-item>
			  <ion-label position="stacked"  color="vibrant">Precio</ion-label>
			  <ion-textarea id="newProductPvpId" value=""  class="ion-text-wrap inputProductPvp">
			</ion-item>
		</ion-list>
	  </ion-col>
	</ion-row>
	<ion-button color="vibrant" onclick="addNewProduct('`+this.categoryProduct.id+`','newProductItem')" slot="end">
		  Añadir
		</ion-button>  
  </ion-item>`;

	  productHTML = productHTML +`</ion-list></ion-content>`;

	  this.innerHTML = productHTML;

	};

  });

function showCategoryDetail(category) {
	const categoryProduct = {};
	categoryProduct.id = category;
	categoryProduct.value = MAP_CATEGORIES_ID.get(category);
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

function saveMenuInfo(){
	showLoading("Guardando datos de la carta");
	var menuInfo = MENU_INFO;
	var arrayCategories = Array.from(MAP_CATEGORIES_ID);
	var newCategories = [];
	arrayCategories.forEach(categoryObject=>{
		newCategories.push(categoryObject[1])
	});

	menuInfo[0].categories = newCategories;
	menuInfo[0].sugerencias = document.getElementById("idSugerencias").value;
	menuInfo[0].nota = document.getElementById("idNota").value;
	sendMenuInfo(localId, menuInfo[0]);
}

function saveSettings() {
	if (page === "local"){
		saveLocalInfo();
	} else if (page === "carta"){
		saveMenuInfo();
	}
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

const sendMenuInfo = (idLocal, menuPostData) => {

	var url = API_PATH_ADMIN+"/local/"+idLocal+"/menu?access_token="+jwtToken;
	var json = JSON.stringify(menuPostData);

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


