const LOGIN = "./login.html";
const WELCOME = "./welcome.html";

var API_PATH_LOGIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";
//var API_PATH_LOGIN = "http://localhost:8080/api/guanmor/1.0.0";
var stripe = Stripe('pk_live_694KCTC09F6l6luGWX4mAiv700FxVom9CO');

window.onload = (e) => { 
	cookieConsent(); 
	window.addEventListener('beforeinstallprompt', (e) => {
		deferredPrompt = e;
	});
	try{
		var plan = GetURLParameter('suscription');
		document.getElementById("suscription").value = plan;
	} catch(e){
	}
    
}

GetURLParameter = function (sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	var code = "basic";
	for (var i = 0; i < sURLVariables.length; i++){
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam){
			if(sParameterName[1]==="basic"||sParameterName[1]==="pro"||sParameterName[1]==="lowcost"){
				code = sParameterName[1];
			}
		}
	}
	return code;
};  
register = function (){
	validateRegister();
};
login = function () {
	goToLogin();
};  


goToLogin = function(){
	window.location.href = LOGIN;

};

goToWelcome = function(){
	window.location.href = WELCOME;

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

	if(user === "" || password ==="" || repassword ==="" || email===""){
		presentToast("Introduzca un nombre de usuario, contraseña y correo electrónico");
	} else if(password !== repassword){
		presentToast("La contraseña repetida no coincide");
	} else if(password !== repassword){
		presentToast("La contraseña repetida no coincide");
	} else if(!validateEmail(email)){
		presentToast("Correo electrónico no válido");
	} else {
		var e = document.getElementById("suscription");
		var plan = e.options[e.selectedIndex].value;
		var acceptMarketing = document.getElementById("checkMarketing").checked;
	
		fetchRegister(user, password, email, plan, acceptMarketing);
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

const getPayment = (plan) => { 
    return axios.get(API_PATH_LOGIN+"/payment/?plan="+plan,{ crossdomain: true })
        .then(response => {
			stripe.redirectToCheckout({
				// Make the id field from the Checkout Session creation API response
				// available to this file, so you can provide it as parameter here
				// instead of the {{CHECKOUT_SESSION_ID}} placeholder.
				sessionId: response.data.id
			  }).then(function (result) {
				  console.info(result);
				// If `redirectToCheckout` fails due to a browser or network
				// error, display the localized error message to your customer
				// using `result.error.message`.
			  });
        })
        .catch(error => {
			presentToast(error.response.data.message)
        });
};

const fetchRegister = (pUser, pPassword, pMail, pPlan, acceptMarketing) => {
	showLoading("Registrando");
	var postData = {
      user: pUser,
	  password: pPassword,
	  email: pMail,
	  plan: pPlan,
	  acceptMarketing: acceptMarketing
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
			goToWelcome();
			/*var response = JSON.parse(xhr.responseText);
			stripe.redirectToCheckout({
				// Make the id field from the Checkout Session creation API response
				// available to this file, so you can provide it as parameter here
				// instead of the {{CHECKOUT_SESSION_ID}} placeholder.
				sessionId: response.id
			  }).then(function (result) {
				  console.info(result);
				// If `redirectToCheckout` fails due to a browser or network
				// error, display the localized error message to your customer
				// using `result.error.message`.
			  });*/
		} else {
			var response = JSON.parse(xhr.responseText);
			presentToast(response.message)
		}
	}
	xhr.send(json);
};

