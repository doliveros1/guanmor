const ADMIN = "./admin.html";
const API_PATH_LOGIN = "https://guanmor.herokuapp.com/api/guanmor/1.0.0";

window.onload = (e) => { 
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
		//fetchLocales();
		fetchLogin(user, password);
		//goToAdmin();
	}

}




//DATA

const fetchLogin = (pUser, pPassword) => {

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
	var users = JSON.parse(xhr.responseText);
	if (xhr.readyState == 4 && xhr.status == "201") {
		console.table(users);
	} else {
		console.error(users);
	}
}
xhr.send(json);
};

