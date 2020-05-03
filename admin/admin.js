var indexCategory = 10;
const LOGIN = "./login.html";

var jwtToken;

window.onload = (e) => { 
	jwtToken = localStorage.getItem("jwt-token");
	selectConfiguration("local");    
}

addNewCategory = function (id) {
    indexCategory = indexCategory + 1;
    var category = "category"+indexCategory;
	var value = document.getElementById(id).value;
	document.getElementById("newCategoryId").value="";

	var lastNode = document.getElementById("newCategoryItem");
	
	var elem = document.createElement('ion-item');
	elem.setAttribute("id", category);

    elem.innerHTML = `<ion-buttons slot="end">
        			<ion-button color="vibrant" onclick="removeCategory('`+category+`')">
      					<ion-icon slot="icon-only" name="trash-outline"></ion-icon>
        			</ion-button>
        			<ion-button color="vibrant">        		
        				<ion-icon slot="icon-only"  name="heart-outline"></ion-icon>
  					</ion-button>
  					<ion-button color="vibrant">        		
        				<ion-icon slot="icon-only"  name="pencil-outline"></ion-icon>
  					</ion-button>
        		</ion-buttons>        		
          		<ion-input value="`+value+`" class="ion-text-wrap">
          		</ion-input>`;
    document.getElementById("listCategories").insertBefore(elem,lastNode);

};

removeCategory = function (id) {
	var lastNode = document.getElementById(id).remove();
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


