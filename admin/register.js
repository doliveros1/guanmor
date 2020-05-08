const LOGIN = "./login.html";
var API_PATH_LOGIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";
//var API_PATH_LOGIN = "http://localhost:8080/api/guanmor/1.0.0";

window.onload = (e) => { 

}
register = function (){
	validateRegister();
};
login = function () {
	goToLogin();
};  


goToLogin = function(){
	window.location.href = LOGIN;

};

function confirmRegister() {
	const alert = document.createElement('ion-alert');
	alert.header = 'Registro';
	alert.subHeader = '¡Registrado correctamente!';
	alert.message = 'A continuación será dirigido a la pantalla de login para que se autentique.';
	alert.buttons = [
		 {
		  text: 'Aceptar',
		  handler: () => {
			goToLogin();
		  }
		}
	  ];
  
	document.body.appendChild(alert);
	return alert.present();
  }

function presentToast(text) {
  const toast = document.createElement('ion-toast');
  toast.message = text;
  toast.duration = 3000;

  document.body.appendChild(toast);
  return toast.present();
}

function validateRegister() {

	var user = document.getElementById("registerUser").value;
	var password = document.getElementById("registerPassword").value;
	var repassword = document.getElementById("registerRePassword").value;
	var email = document.getElementById("registerMail").value;
	var promocion = document.getElementById("registerCodPromocion").value;

	if(user === "" || password ==="" || repassword ==="" || email===""){
		presentToast("Introduzca un nombre de usuario, contraseña y correo electrónico");
	} else if(password !== repassword){
		presentToast("La contraseña repetida no coincide");
	} else if(password !== repassword){
		presentToast("La contraseña repetida no coincide");
	} else if(!validateEmail(email)){
		presentToast("Correo electrónico no válido");
	} else {
		fetchRegister(user,password,email,promocion);
	}

}

function validateEmail(mail) {
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
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


//DATA

const fetchRegister = (pUser, pPassword, pMail, pPromocion) => {
	showLoading("Autenticando");
	var postData = {
      user: pUser,
	  password: pPassword,
	  email: pMail,
	  promocion: pPromocion
	  
    };
    // Post a user
	var url = API_PATH_LOGIN+"/signing/register";
	var json = JSON.stringify(postData);

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-type','application/json');
	xhr.onload = function () {
		hideLoading();
		if (xhr.readyState == 4 && xhr.status == "200") {		
			confirmRegister();
		} else {
			var response = JSON.parse(xhr.responseText);
			presentToast(response.message)
		}
	}
	xhr.send(json);
};

