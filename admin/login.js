const ADMIN = "./admin.html";
const REGISTER = "./register.html";

var API_PATH_LOGIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";
//var API_PATH_LOGIN = "http://localhost:8080/api/guanmor/1.0.0";
var stripe = Stripe('pk_test_eeMsoTVs3SZt2Nn5p7k1LPmx00kPvt407h');

// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/admin/service-worker.js');
  });
}

window.onload = (e) => { 
	if(localStorage.getItem("jwt-token")!== null){
		goToAdmin();
	}
}

login = function () {
	validateLogin();
};  

register = function () {
	goToRegister();
};  

function recover() {
  const alert = document.createElement('ion-alert');
  alert.header = 'Recuperar contraseña';
  alert.inputs = [
    {
	  placeholder: 'email',
	  name: 'email'
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
      text: 'Enviar por correo',
      handler: (data) => {
        sendMail(data.email);
      }
    }
  ];

  document.body.appendChild(alert);
  return alert.present();
};


goToAdmin = function(){
	window.location.href = ADMIN;

};

goToRegister = function(){
	window.location.href = REGISTER;
};

function presentToast(text) {
  const toast = document.createElement('ion-toast');
  toast.message = text;
  toast.duration = 3000;

  document.body.appendChild(toast);
  return toast.present();
}

function validateLogin() {
	var user = document.getElementById("loginUser").value;
	var password = document.getElementById("loginPassword").value;
	if(user === "" || password ===""){
		presentToast("Introduzca usuario y password");
	} else{
		fetchLogin(user, password);
	}

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

const fetchLogin = (pUser, pPassword) => {
	showLoading("Autenticando");
	var postData = {
      user: pUser,
      password: pPassword
    };
    // Post a user
	var url = API_PATH_LOGIN+"/signing/login";
	var json = JSON.stringify(postData);

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-type','application/json');
	xhr.onload = function () {
		hideLoading();
		var response = JSON.parse(xhr.responseText);
		if (xhr.readyState == 4 && xhr.status == "200") {		
			localStorage.setItem('jwt-token', response.token);
			localStorage.setItem('localId', response.user);
			goToAdmin();
    } else if(xhr.status == "403"){
			var response = JSON.parse(xhr.responseText);
			stripe.redirectToCheckout({
				// Make the id field from the Checkout Session creation API response
				// available to this file, so you can provide it as parameter here
				// instead of the {{CHECKOUT_SESSION_ID}} placeholder.
				sessionId: JSON.parse(response.message).id
			  }).then(function (result) {
				  console.info(result);
				// If `redirectToCheckout` fails due to a browser or network
				// error, display the localized error message to your customer
				// using `result.error.message`.
			  });
		} 
     else {
			presentToast(response.message)
		}
	}
	xhr.send(json);
};

const sendMail = (email) => {
    return axios.get(API_PATH_LOGIN+"/recoverPassword/?mail="+email,{ crossdomain: true })
        .then(response => {
			presentToast("Se ha enviado un correo a la dirección: "+email);
        })
        .catch(error => {
			presentToast(error.response.data.message)

        });
};

