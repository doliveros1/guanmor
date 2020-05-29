var API_PATH_ADMIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";
//var API_PATH_ADMIN = "http://localhost:8080/api/guanmor/1.0.0";
var stripe = Stripe('pk_live_694KCTC09F6l6luGWX4mAiv700FxVom9CO');
var s3bucket = "https://i-love-menu.s3.eu-west-2.amazonaws.com/"

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
var qrcode = null;

var firstTime = true;
var page;

window.onload = (e) => { 
	nav = document.querySelector('ion-nav');
	// Inicializar el proveedor de credenciales de Amazon Cognito
AWS.config.region = 'eu-west-2'; // Región
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'eu-west-2:a777e4e5-5a34-4511-b113-4a1b74c31911',
});

	jwtToken = localStorage.getItem("jwt-token");
	if(jwtToken === null){
		goToLogin();
	} else {
		localId = localStorage.getItem("localId");
		selectConfiguration("local");  
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
						<ion-icon class="inputEnableCategory" slot="icon-only"  name="eye-outline"></ion-icon>
  					</ion-button>
  					<ion-button color="vibrant" onclick="showCategoryDetail('`+category+`')">        		
        				<ion-icon slot="icon-only"  name="pencil-outline"></ion-icon>
  					</ion-button>
        		</div>        		
          		<ion-textarea value="`+value+`" class="ion-text-wrap">
          		</ion-textarea>`;
	document.getElementById("listCategories").insertBefore(elem,lastNode);	
	
	saveMenuInfo();


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
					<ion-input type="number" onfocusout="updateProduct('`+idCategory+`','`+idProduct+`')" value="`+productObject.pvp+`" class="ion-text-wrap inputProductPvp">
				</ion-item>
			</ion-col>
			<ion-col>
				<div align="right">
				<ion-button color="vibrant" onclick="removeProduct('`+idCategory+`','`+product+`')" >
				<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
				  </ion-button>
				  <ion-button color="vibrant" onclick="checkEnableProduct('`+idCategory+`','`+product+`')" >        		
				  <ion-icon class="inputEnableProduct" slot="icon-only"  name="eye-outline"></ion-icon>
					</ion-button>
				</div>
			</ion-col>
		</ion-row>
		<ion-row>
		<ion-label color="vibrant">Alérgenos</ion-label>
	</ion-row>
	<ion-row>		
		<ion-col>
			<div class="row" >
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputAltramuces" onclick="updateAllergen('inputAltramuces','`+product+`')" id="altramuces" color="vibrant" slot="start" `+isAllergenChecked('altramuces',product)+`></ion-checkbox>
						<ion-label>Altramuces</ion-label>
					  </ion-item>
				  </div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputApio"  onclick="updateAllergen('inputApio','`+product+`')" id="apio" color="vibrant" slot="start" `+isAllergenChecked('apio',product)+`></ion-checkbox>
						<ion-label>Apio</ion-label>
					</ion-item>					
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputCacahuetes" onclick="updateAllergen('inputCacahuetes','`+product+`')" id="cacahuetes" color="vibrant" slot="start" `+isAllergenChecked('cacahuetes',product)+`></ion-checkbox>
						<ion-label>Cacahuetes</ion-label>
					</ion-item>	
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputCascara" onclick="updateAllergen('inputCascara','`+product+`')" id="cascara" color="vibrant" slot="start" `+isAllergenChecked('cascara',product)+`></ion-checkbox>
						<ion-label>Cáscara</ion-label>
					</ion-item>	
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputCrustaceos" onclick="updateAllergen('inputCrustaceos','`+product+`')" id="crustaceos" color="vibrant" slot="start" `+isAllergenChecked('crustaceos',product)+`></ion-checkbox>
						<ion-label>Crustáceos</ion-label>
					</ion-item>	
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputGluten" onclick="updateAllergen('inputGluten','`+product+`')" id="gluten" color="vibrant" slot="start" `+isAllergenChecked('gluten',product)+`></ion-checkbox>
						<ion-label>Gluten</ion-label>
					</ion-item>						
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputHuevos" onclick="updateAllergen('inputHuevos','`+product+`')" id="huevos" color="vibrant" slot="start" `+isAllergenChecked('huevos',product)+`></ion-checkbox>
						<ion-label>Huevos</ion-label>
					</ion-item>							
				</div>
			</div>
		</ion-col>	
		<ion-col>
			<div class="row" >
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputLacteos" onclick="updateAllergen('inputLacteos','`+product+`')" id="lacteos" color="vibrant" slot="start" `+isAllergenChecked('lacteos',product)+`></ion-checkbox>
						<ion-label>Lácteos</ion-label>
					</ion-item>						
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputMoluscos" onclick="updateAllergen('inputMoluscos','`+product+`')" id="moluscos" color="vibrant" slot="start" `+isAllergenChecked('moluscos',product)+`></ion-checkbox>
						<ion-label>Moluscos</ion-label>
					</ion-item>						
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputMostaza" onclick="updateAllergen('inputMostaza','`+product+`')" id="mostaza" color="vibrant" slot="start"`+isAllergenChecked('mostaza',product)+`></ion-checkbox>
						<ion-label>Mostaza</ion-label>
					</ion-item>	
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputPescado" onclick="updateAllergen('inputPescado','`+product+`')" id="pescado" color="vibrant" slot="start"`+isAllergenChecked('pescado',product)+`></ion-checkbox>
						<ion-label>Pescado</ion-label>
					</ion-item>						
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputSesamo" onclick="updateAllergen('inputSesamo','`+product+`')" id="sesamo" color="vibrant" slot="start" `+isAllergenChecked('sesamo',product)+`></ion-checkbox>
						<ion-label>Sésamo</ion-label>
					</ion-item>							
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputSoja" onclick="updateAllergen('inputSoja','`+product+`')" id="soja" color="vibrant" slot="start" `+isAllergenChecked('soja',product)+`></ion-checkbox>
						<ion-label>Soja</ion-label>
					</ion-item>						
				</div>
				<div class="col">
					<ion-item>
						<ion-checkbox class="inputSulfitos" onclick="updateAllergen('inputSulfitos','`+product+`')" id="sulfitos" color="vibrant" slot="start" `+isAllergenChecked('sulfitos',product)+`></ion-checkbox>
						<ion-label>Sulfitos</ion-label>
					</ion-item>							
				</div>
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
				  <ion-icon class="inputEnableProduct" slot="icon-only"  name="eye-outline"></ion-icon>
					</ion-button>
			  </ion-buttons>  
			 `;*/
				  
	document.getElementById("listProducts").insertBefore(elem,lastNode);

	saveMenuInfo();

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
	if(inputEnable[0].name === "eye-off-outline"){
		enable = true;
		inputEnable[0].name = "eye-outline";
	} else if(inputEnable[0].name === "eye-outline"){
		enable = false;
		inputEnable[0].name = "eye-off-outline";
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

updateAllergen = function(allergen, idProduct){
	//alert(allergen+" "+idProduct);
	var listAllergens = [];
	var product = MAP_PRODUCTS_ID.get(idProduct);
	var docProduct = document.getElementById(idProduct);

	if(docProduct.getElementsByClassName(allergen)[0].checked){
		docProduct.getElementsByClassName(allergen)[0].checked = false;
	} else {
		docProduct.getElementsByClassName(allergen)[0].checked = true;
	}

	if(docProduct.getElementsByClassName("inputAltramuces")[0].checked){
		listAllergens.push("altramuces");
	}
	if(docProduct.getElementsByClassName("inputApio")[0].checked){
		listAllergens.push("apio");
	}	
	if(docProduct.getElementsByClassName("inputCacahuetes")[0].checked){
		listAllergens.push("cacahuetes");
	}	
	if(docProduct.getElementsByClassName("inputCascara")[0].checked){
		listAllergens.push("cascara");
	}	
	if(docProduct.getElementsByClassName("inputCrustaceos")[0].checked){
		listAllergens.push("crustaceos");
	}	
	if(docProduct.getElementsByClassName("inputGluten")[0].checked){
		listAllergens.push("gluten");
	}	
	if(docProduct.getElementsByClassName("inputHuevos")[0].checked){
		listAllergens.push("huevos");
	}	
	if(docProduct.getElementsByClassName("inputLacteos")[0].checked){
		listAllergens.push("lacteos");
	}
	if(docProduct.getElementsByClassName("inputMostaza")[0].checked){
		listAllergens.push("moluscos");
	}
	if(docProduct.getElementsByClassName("inputMostaza")[0].checked){
		listAllergens.push("mostaza");
	}
	if(docProduct.getElementsByClassName("inputPescado")[0].checked){
		listAllergens.push("pescado");
	}
	if(docProduct.getElementsByClassName("inputSesamo")[0].checked){
		listAllergens.push("sesamo");
	}
	if(docProduct.getElementsByClassName("inputSoja")[0].checked){
		listAllergens.push("soja");
	}
	if(docProduct.getElementsByClassName("inputSulfitos")[0].checked){
		listAllergens.push("sulfitos");
	}

	if(docProduct.getElementsByClassName(allergen)[0].checked){
		docProduct.getElementsByClassName(allergen)[0].checked = false;
	} else {
		docProduct.getElementsByClassName(allergen)[0].checked = true;
	}

	product.alergenos = listAllergens;

}

checkEnableProduct = function (idCategory, idProduct) {
	var inputEnable = document.getElementById(idProduct).getElementsByClassName("inputEnableProduct");
	var enable;
	if(inputEnable[0].name === "eye-off-outline"){
		enable = true;
		inputEnable[0].name = "eye-outline";
	} else if(inputEnable[0].name === "eye-outline"){
		enable = false;
		inputEnable[0].name = "eye-off-outline";
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
		document.getElementById("settings").style.display="none";	
		document.getElementById("mainTitle").innerHTML="Configura tu local";
		fetchLocal(localId);		

	} else if(idConfiguration === "carta"){
		document.getElementById("local").style.display="none";
		document.getElementById("carta").style.display="block";
		document.getElementById("code").style.display="none";	
		document.getElementById("settings").style.display="none";		
		document.getElementById("mainTitle").innerHTML="Configura tu carta";	
		fetchMenu(localId);		
	} else if(idConfiguration === "code"){
		document.getElementById("local").style.display="none";
		document.getElementById("carta").style.display="none";
		document.getElementById("code").style.display="block";		
		document.getElementById("settings").style.display="none";	
		document.getElementById("mainTitle").innerHTML="Comparte tu carta";	
		document.getElementById("linkCarta").value = "https://www.ilovemenu.es/menu/menu.html?property="+window.btoa(localId);
		if(qrcode !== null){
			qrcode.clear(); // clear the code.
			qrcode.makeCode("https://www.ilovemenu.es/menu/menu.html?property="+window.btoa(localId)); // make another code.
		} else{
			qrcode = new QRCode(document.getElementById("qrcode"), "https://www.ilovemenu.es/menu/menu.html?property="+window.btoa(localId));
		}
		setColors();
		if(LOCAL_INFO.urlLogo !== undefined){
			document.getElementById("logobar").value = LOCAL_INFO.urlLogo;
		}
	} else if(idConfiguration === "settings"){
		document.getElementById("local").style.display="none";
		document.getElementById("carta").style.display="none";
		document.getElementById("code").style.display="none";		
		document.getElementById("settings").style.display="block";		
		document.getElementById("mainTitle").innerHTML="Configura tu cuenta";	
		fetchPreferences(localId);	
	} else if(idConfiguration === "exit"){
		goToLogin();		
	}
	closeMenu();

};
function setColors(){
	if(LOCAL_INFO.colorHeader === undefined){
		LOCAL_INFO.colorHeader = "#1B1B1E";
		LOCAL_INFO.colorMain = "#3ed7ca";
		LOCAL_INFO.colorText = "#FFFFFF";
		LOCAL_INFO.colorFooter = "#1B1B1E";
	} 

	document.getElementById('pickheader').jscolor.fromString(LOCAL_INFO.colorHeader);
	document.getElementById("pickmain").jscolor.fromString(LOCAL_INFO.colorMain);
	document.getElementById("picktext").jscolor.fromString(LOCAL_INFO.colorText);
	document.getElementById("pickfooter").jscolor.fromString(LOCAL_INFO.colorFooter);
}
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

function changePassword(){
	const alert = document.createElement('ion-alert');
	alert.header = 'Cambiar password';
	alert.inputs = [
	  {
		placeholder: 'Password actual',
		name: 'oldPassword',
		type: 'password'
	  },
	  {
		placeholder: 'Password nueva',
		name: 'newPassword',
		type: 'password'
	  }
	];
	alert.buttons = [
	  {
		text: 'Cancelar',
		role: 'cancel',
		cssClass: 'secondary',
		handler: () => {
		  console.log('Confirm Cancel')
		}
	  }, {
		text: 'Cambiar',
		handler: (data) => {
			preferences = {};
			preferences.type = "password";
			preferences.oldPassword = data.oldPassword;
			preferences.newPassword = data.newPassword;
			sendPreferences(localId, preferences);
		}
	  }
	];
  
	document.body.appendChild(alert);
	return alert.present();
}

manageSubscription = async function () {
	doDeregister();
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
	document.getElementById("codPostal").value = localInfo.codPostal;
	document.getElementById("latitude").value = localInfo.latitude;	
	document.getElementById("longitude").value = localInfo.longitude;
	document.getElementById("description").value = localInfo.description;
	document.getElementById("phoneNumber").value = localInfo.phoneNumber;
	document.getElementById("whatsapp").value = localInfo.whatsapp;
	document.getElementById("timeTable").value = localInfo.timeTable;
	document.getElementById("card").checked = localInfo.card;
	document.getElementById("cash").checked = localInfo.cash;
	document.getElementById("homeDelivery").checked = localInfo.homeDelivery;	
	document.getElementById("whatsappOrder").checked = localInfo.orderEnabled;	

	if(firstTime){
		createNavCategories();
		firstTime = false;
	}

}

function setMenuInfo(menuInfo){
	MAP_CATEGORIES_ID = new Map();
	var categoryHTML = "";
	MENU_INFO = menuInfo;
	
	if(LOCAL_INFO.plan==="lowcost") {
		document.getElementById("idDocumento").value = menuInfo[0].documentoUrl;
	} else {
		document.getElementById("idDocumento").value = menuInfo[0].documentoUrl;
		document.getElementById("idSugerencias").value = menuInfo[0].sugerencias;
		document.getElementById("idNota").value = menuInfo[0].nota;
		var listCategories = document.getElementById("listCategories");
		var iconHeart="";
		menuInfo[0].categories.forEach(category=>{
			indexCategory = indexCategory +1;
			var idCategory = "category"+indexCategory;
			MAP_CATEGORIES_ID.set(idCategory,category);
			if(category.enable){
				iconHeart = "eye-outline";
			} else{
				iconHeart = "eye-off-outline";
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

	}

};

function setPreferencesInfo(preferencesInfo){
	document.getElementById("idSettingsUser").value = preferencesInfo.username;
	document.getElementById("idSettingsEmail").value = preferencesInfo.email;
	document.getElementById("idPlan").value = preferencesInfo.plan;

}

function createNavCategories(){
customElements.define('nav-categories', class NavHome extends HTMLElement {
	connectedCallback() {
	  var categoryHTML = "";

	  categoryHTML = `
	  <ion-content fullscreen>`;
	
	  if(LOCAL_INFO.plan !== "lowcost"){
		categoryHTML = categoryHTML+ `<ion-header translucent>
		<ion-toolbar color="vibrant">
		  <ion-title>Categorías</ion-title>
		  		<ion-button target="_blank" href="../ilovemenu_template.xlsx" size="small" slot="end" color="danger" >
					Bajar Template Excel
				</ion-button>
		</ion-toolbar>
	  </ion-header>
	  <ion-item>
      <ion-label id="profile_image" color="dark" stacked>Subir excel con la carta</ion-label>
      <input id="cartaExcel" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" ></input>
    </ion-item>
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
		  <ion-item>
		  	<ion-textarea placeholder="Enlace a tu documento" id="idDocumento"></ion-textarea >
		  </ion-item>
	  </ion-list>
	  </ion-content>
	`;
	  } else {
		categoryHTML = categoryHTML+ `
		<ion-list-header color="vibrant">
		<ion-title>Enlace a tu carta</ion-title>       
		 </ion-list-header>
		 <ion-item>
		 <ion-textarea placeholder="Enlace a tu documento" id="idDocumento"></ion-textarea >
	 </ion-item>
		  <ion-item>
			<input accept="application/pdf" type="file" id="idSubmit">
		  </ion-item>
	  </ion-list>
	  </ion-content>
	`

	  }
	  
	  this.innerHTML = categoryHTML;
	  console.info(categoryHTML);
	}
  });
};

function readFile(file) {
	if(file!==undefined){
		showLoading("Subiendo carta en pdf"); 
		var s3 = new AWS.S3();
		var extension = file.name.split('.').pop();
		var content = file.type;
		var params = {Bucket: 'i-love-menu', Key: localId+"."+extension, ContentType: content, Body: file, ACL: 'public-read'};
		s3.putObject(params, function(err, data) {
			hideLoading();
			if(err===null){
				document.getElementById("idDocumento").value = s3bucket+localId+"."+extension;
				var menuInfo = MENU_INFO;
				menuInfo[0].documentoUrl = document.getElementById("idDocumento").value;
				sendMenuInfo(localId, menuInfo[0], true);		
			} else {
				presentToast("Error al subir el fichero");
			}
		});
	} else {
		var menuInfo = MENU_INFO;
		menuInfo[0].documentoUrl = document.getElementById("idDocumento").value;
		sendMenuInfo(localId, menuInfo[0], false);		
	}	
  }

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
			<ion-buttons slot="end">
				<ion-button >
					<ion-icon size="large" slot="icon-only" name="camera-outline">
					</ion-icon>
				</ion-button>
        	</ion-buttons>
		  </ion-toolbar>
		</ion-header>
		<ion-content fullscreen class="ion-padding">
		<ion-list id="listProducts">
	  `;
	  this.categoryProduct.value.products.forEach(product=>{
		var iconHeart;
		if(product.enable){
			iconHeart = "eye-outline";
		} else{
			iconHeart = "eye-off-outline";
		}
		indexProduct = indexProduct +1;
		var idProduct = "product"+indexProduct;
		MAP_PRODUCTS_ID.set(idProduct, product);
		productHTML = productHTML + `<ion-item class="allProductItem" id="`+idProduct+`">

		<ion-grid>
        <ion-row >
          <ion-col size=8>
			<ion-item color="light" class="productItem" >
				<ion-label position="stacked"  color="vibrant" >Título</ion-label>
				<ion-textarea onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.title+`" class="ion-text-wrap inputProductTitle">
			</ion-item>
		  </ion-col>  
		  <ion-col size=4>
			  <div align="right">
			  	<ion-button color="vibrant" onclick="addPhoto('`+this.categoryProduct.id+`','`+idProduct+`')" >
			  		<ion-icon slot="icon-only" name="camera-outline"></ion-icon>
		  		</ion-button>
				<ion-button color="vibrant" onclick="removeProduct('`+this.categoryProduct.id+`','`+idProduct+`')" >
					<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
				</ion-button>
				<ion-button color="vibrant" onclick="checkEnableProduct('`+this.categoryProduct.id+`','`+idProduct+`')" >        		
					<ion-icon class="inputEnableProduct" slot="icon-only"  name="`+iconHeart+`"></ion-icon>
				</ion-button>
			</div>
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
				<ion-input type="number" onfocusout="updateProduct('`+this.categoryProduct.id+`','`+idProduct+`')" value="`+product.pvp+`" class="ion-text-wrap inputProductPvp">
			</ion-item>
		  </ion-col> 		       
		</ion-row>
		<ion-row>
			<ion-label color="vibrant">Alérgenos</ion-label>
		</ion-row>
		<ion-row>		
			<ion-col>
				<div class="row" >
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputAltramuces" onclick="updateAllergen('inputAltramuces','`+idProduct+`')" id="altramuces" color="vibrant" slot="start" `+isAllergenChecked('altramuces',product)+`></ion-checkbox>
							<ion-label>Altramuces</ion-label>
				  		</ion-item>
				  	</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputApio"  onclick="updateAllergen('inputApio','`+idProduct+`')" id="apio" color="vibrant" slot="start" `+isAllergenChecked('apio',product)+`></ion-checkbox>
							<ion-label>Apio</ion-label>
						</ion-item>					
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputCacahuetes" onclick="updateAllergen('inputCacahuetes','`+idProduct+`')" id="cacahuetes" color="vibrant" slot="start" `+isAllergenChecked('cacahuetes',product)+`></ion-checkbox>
							<ion-label>Cacahuetes</ion-label>
						</ion-item>	
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputCascara" onclick="updateAllergen('inputCascara','`+idProduct+`')" id="cascara" color="vibrant" slot="start" `+isAllergenChecked('cascara',product)+`></ion-checkbox>
							<ion-label>Cáscara</ion-label>
						</ion-item>	
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputCrustaceos" onclick="updateAllergen('inputCrustaceos','`+idProduct+`')" id="crustaceos" color="vibrant" slot="start" `+isAllergenChecked('crustaceos',product)+`></ion-checkbox>
							<ion-label>Crustáceos</ion-label>
						</ion-item>	
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputGluten" onclick="updateAllergen('inputGluten','`+idProduct+`')" id="gluten" color="vibrant" slot="start" `+isAllergenChecked('gluten',product)+`></ion-checkbox>
							<ion-label>Gluten</ion-label>
						</ion-item>						
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputHuevos" onclick="updateAllergen('inputHuevos','`+idProduct+`')" id="huevos" color="vibrant" slot="start" `+isAllergenChecked('huevos',product)+`></ion-checkbox>
							<ion-label>Huevos</ion-label>
						</ion-item>							
					</div>
				</div>
			</ion-col>	
			<ion-col>
				<div class="row" >
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputLacteos" onclick="updateAllergen('inputLacteos','`+idProduct+`')" id="lacteos" color="vibrant" slot="start" `+isAllergenChecked('lacteos',product)+`></ion-checkbox>
							<ion-label>Lácteos</ion-label>
						</ion-item>						
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputMoluscos" onclick="updateAllergen('inputMoluscos','`+idProduct+`')" id="moluscos" color="vibrant" slot="start" `+isAllergenChecked('moluscos',product)+`></ion-checkbox>
							<ion-label>Moluscos</ion-label>
						</ion-item>						
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputMostaza" onclick="updateAllergen('inputMostaza','`+idProduct+`')" id="mostaza" color="vibrant" slot="start"`+isAllergenChecked('mostaza',product)+`></ion-checkbox>
							<ion-label>Mostaza</ion-label>
						</ion-item>	
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputPescado" onclick="updateAllergen('inputPescado','`+idProduct+`')" id="pescado" color="vibrant" slot="start"`+isAllergenChecked('pescado',product)+`></ion-checkbox>
							<ion-label>Pescado</ion-label>
						</ion-item>						
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputSesamo" onclick="updateAllergen('inputSesamo','`+idProduct+`')" id="sesamo" color="vibrant" slot="start" `+isAllergenChecked('sesamo',product)+`></ion-checkbox>
							<ion-label>Sésamo</ion-label>
						</ion-item>							
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputSoja" onclick="updateAllergen('inputSoja','`+idProduct+`')" id="soja" color="vibrant" slot="start" `+isAllergenChecked('soja',product)+`></ion-checkbox>
							<ion-label>Soja</ion-label>
						</ion-item>						
					</div>
					<div class="col">
						<ion-item>
							<ion-checkbox class="inputSulfitos" onclick="updateAllergen('inputSulfitos','`+idProduct+`')" id="sulfitos" color="vibrant" slot="start" `+isAllergenChecked('sulfitos',product)+`></ion-checkbox>
							<ion-label>Sulfitos</ion-label>
						</ion-item>							
					</div>
				</div>
			</ion-col>		
		</ion-row>


		</ion-grid></ion-item>`;


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

function onChange($event){
	console.log($event.target.value);
}

function isAllergenChecked(allergen, product){
	if(product.hasOwnProperty("alergenos") && product.alergenos.includes(allergen)){
		return "checked";
	} else {
		return "";
	}
}

function saveLocalInfo(){
	var localInfo = {};
	localInfo.id = document.getElementById("id").value;
	localInfo.propertyName = document.getElementById("propertyName").value;
	localInfo.shortName = document.getElementById("shortName").value;
	localInfo.codPostal = document.getElementById("codPostal").value;
	localInfo.latitude = document.getElementById("latitude").value;
	localInfo.longitude = document.getElementById("longitude").value;
	localInfo.description = document.getElementById("description").value;
	localInfo.phoneNumber = document.getElementById("phoneNumber").value;
	localInfo.whatsapp = document.getElementById("whatsapp").value;
	localInfo.timeTable = document.getElementById("timeTable").value;
	localInfo.card = document.getElementById("card").checked;
	localInfo.cash = document.getElementById("cash").checked;
	localInfo.homeDelivery = document.getElementById("homeDelivery").checked;	
	localInfo.orderEnabled = document.getElementById("whatsappOrder").checked;

	LOCAL_INFO = localInfo;
	sendLocalInfo(localId, localInfo);
}

function saveCustomizeInfo(){
	var localInfo = {};
	localInfo.colorHeader = document.getElementById("pickheader").value;
	localInfo.colorMain = document.getElementById("pickmain").value;
	localInfo.colorText = document.getElementById("picktext").value;
	localInfo.colorFooter = document.getElementById("pickfooter").value;
	localInfo.urlLogo = document.getElementById("logobar").value;
	
	LOCAL_INFO = localInfo;
	sendLocalInfo(localId, localInfo);
}

function saveMenuInfo(){

	if(LOCAL_INFO.plan==="lowcost"){
		readFile(document.getElementById("idSubmit").files[0]);
	} else {
		var menuInfo = MENU_INFO;
		var arrayCategories = Array.from(MAP_CATEGORIES_ID);
		var newCategories = [];
		if(document.getElementById("cartaExcel").files.length>0){
			var file = document.getElementById("cartaExcel").files[0];
			var reader = new FileReader();  
			reader.onload = function(e) {
			  var data = e.target.result;
			  var workbook = XLSX.read(data, {
				type: 'binary'
			  });
				workbook.SheetNames.forEach(function(sheetName) {
				// Here is your object
				var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
				var json_object = JSON.stringify(XL_row_object);
					newCategories = getCategoriesFromExcel(json_object);
					menuInfo[0].categories = newCategories;
					if(LOCAL_INFO.plan !== "lowcost"){
						menuInfo[0].sugerencias = document.getElementById("idSugerencias").value;
						menuInfo[0].nota = document.getElementById("idNota").value;
					}
				
					menuInfo[0].documentoUrl = document.getElementById("idDocumento").value;
					sendMenuInfo(localId, menuInfo[0], true);
				})  
			};
			  reader.onerror = function(ex) {
			  console.log(ex);
			};
			  reader.readAsBinaryString(file);			
		} else{
			arrayCategories.forEach(categoryObject=>{
				newCategories.push(categoryObject[1])
			});
			menuInfo[0].categories = newCategories;
			if(LOCAL_INFO.plan !== "lowcost"){
				menuInfo[0].sugerencias = document.getElementById("idSugerencias").value;
				menuInfo[0].nota = document.getElementById("idNota").value;
			}
		
			menuInfo[0].documentoUrl = document.getElementById("idDocumento").value;
			sendMenuInfo(localId, menuInfo[0], false);
		}	
	
		
	}

}

function savePreferencesInfo(){
	preferences = {};
	preferences.type = "email";
	preferences.email = document.getElementById("idSettingsEmail").value;
	sendPreferences(localId, preferences);
}

function saveSettings() {
	if (page === "local"){
		saveLocalInfo();
	} else if (page === "carta"){
		saveMenuInfo();
	} else if (page === "settings"){
		savePreferencesInfo();
	} else if (page === "code"){
		saveCustomizeInfo();
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
			var localInfo = response.data;
        	setLocalInfo(localInfo);
        	hideLoading();
        })
        .catch(error => {
			hideLoading();
			presentToast(error.response.data.message)
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
			presentToast(error.response.data.message)
        	goToLogin();
        });
};

const fetchPreferences = (idLocal) => {
	showLoading("Obteniendo preferencias del usuario"); 
    return axios.get(API_PATH_ADMIN+"/settings/?access_token="+jwtToken,{ crossdomain: true })
        .then(response => {
        	setPreferencesInfo(response.data);
        	hideLoading();
        })
        .catch(error => {
			hideLoading();
			presentToast(error.response.data.message)
        	goToLogin();
        });
};


const sendLocalInfo = (idLocal, localPostData) => {
	showLoading("Guardando datos del local"); 
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
		hideLoading();
		presentToast("Fallo al actualizar preferencias");
		fetchLocal(idLocal);
	}
}
	xhr.send(json);
};

const sendMenuInfo = (idLocal, menuPostData, refresh) => {
	showLoading("Guardando datos de la carta"); 
	var url = API_PATH_ADMIN+"/local/"+idLocal+"/menu?access_token="+jwtToken;
	var json = JSON.stringify(menuPostData);

	var xhr = new XMLHttpRequest();
	xhr.open("PUT", url, true);
	xhr.setRequestHeader('Content-type','application/json');
	xhr.onload = function () {
	if (xhr.readyState == 4 && xhr.status == "200") {
		hideLoading();
		if(refresh){
			fetchMenu(idLocal);
		}
	    presentToast("Datos guardados correctamente");
	} else if(xhr.status == "403"){
		hideLoading();
		goToLogin();
	}else {
		hideLoading();
		presentToast("Fallo al actualizar preferencias");
		fetchMenu(idLocal);
	}
}
	xhr.send(json);
};

const sendPreferences = (idLocal, preferencesInfo) => {
	showLoading("Guardando preferencias"); 
	var url = API_PATH_ADMIN+"/settings/?access_token="+jwtToken;
	var json = JSON.stringify(preferencesInfo);

	var xhr = new XMLHttpRequest();
	xhr.open("PUT", url, true);
	xhr.setRequestHeader('Content-type','application/json');
	xhr.onload = function () {
		var response = JSON.parse(xhr.responseText);
		hideLoading();
		if (xhr.readyState == 4 && xhr.status == "200") {
			localStorage.setItem('jwt-token', response.token);
			presentToast("Datos guardados correctamente");
		} else if(xhr.status == "403"){
			goToLogin();
		}else {
			presentToast(response.message)
			fetchPreferences(idLocal);
		}
	}	
	xhr.send(json);
};

const doDeregister = () => {
	showLoading("Accediendo a la administración de la subscripción"); 
    return axios.get(API_PATH_ADMIN+"/deregister/?access_token="+jwtToken,{ crossdomain: true })
        .then(response => {
			hideLoading();
			window.location.href = response.data.urlRedirect;			

			//goToLogin();
        })
        .catch(error => {
			presentToast(error.response.data.message);
			hideLoading();
        });
};

function getCategoriesFromExcel(object){
	var mapCategories = {};
	var finalCategories = [];
	var excelCategories = JSON.parse(object);
	excelCategories.forEach(product=>{
		if(product.CATEGORIA in mapCategories){
			mapCategories[product.CATEGORIA].push(getAPIProduct(product));
		} else {
			mapCategories[product.CATEGORIA] = [];
			mapCategories[product.CATEGORIA].push(getAPIProduct(product));
		}
	});
	var categoryNew;
	Object.entries(mapCategories).forEach(cat=>{
		categoryNew = {};
		categoryNew.title = cat[0];
		categoryNew.enable = true;
		categoryNew.products = cat[1];
		finalCategories.push(categoryNew);
	});
	return finalCategories;
}

function getAPIProduct(product){
	var apiProduct = {};
	apiProduct.title = product.NOMBRE_PRODUCTO;
	apiProduct.description = product.DESCRIP_PRODUCTO;
	apiProduct.pvp = product.PRECIO;
	apiProduct.enable = true;
	apiProduct.alergenos = [];
	if(product.ALER_ALTRAMUCES === "1"){
		apiProduct.alergenos.push("altramuces");
	}
	if(product.ALER_APIO === "1"){
		apiProduct.alergenos.push("apio");
	}
	if(product.ALER_CACAHUETES === "1"){
		apiProduct.alergenos.push("cacahuetes");
	}
	if(product.ALER_CASCARA === "1"){
		apiProduct.alergenos.push("cascara");
	}
	if(product.ALER_CRUSTACEOS === "1"){
		apiProduct.alergenos.push("crustaceos");
	}
	if(product.ALER_GLUTEN === "1"){
		apiProduct.alergenos.push("gluten");
	}
	if(product.ALER_HUEVOS === "1"){
		apiProduct.alergenos.push("huevos");
	}
	if(product.ALER_LACTEOS === "1"){
		apiProduct.alergenos.push("lacteos");
	}
	if(product.ALER_MOLUSCOS === "1"){
		apiProduct.alergenos.push("moluscos");
	}
	if(product.ALER_MOSTAZA === "1"){
		apiProduct.alergenos.push("mostaza");
	}
	if(product.ALER_PESCADO === "1"){
		apiProduct.alergenos.push("pescado");
	}
	if(product.ALER_SESAMO === "1"){
		apiProduct.alergenos.push("sesamo");
	}
	if(product.ALER_SOJA === "1"){
		apiProduct.alergenos.push("soja");
	}
	if(product.ALER_SULFITOS === "1"){
		apiProduct.alergenos.push("sulfitos");
	}
	return apiProduct;

}

