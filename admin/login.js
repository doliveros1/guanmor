const ADMIN = "./admin.html";
const API_PATH_LOGIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";

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


goToAdmin = function(){
	window.location.href = ADMIN;

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
		} else {
			presentToast(response.message)
		}
	}
	xhr.send(json);
};

