const HOME = "./index.html"
const MENU_BASE_URL = "https://www.ilovemenu.es/menu/menu.html";
const SERVICE_WORKER = '/menu/service-worker.js';
const API_PATH = "https://guanmor.herokuapp.com/api/guanmor/1.0.0/local/";
//const API_PATH = "http://localhost:8080/api/guanmor/1.0.0/local/";

var localId;
var propertyInfo;
var propertyMenu;
var firstTime = true;
var codeLanguaje = null;

var clientAddress;

var inputCon = 0;
var loading;
var numProductos=0;

var isPickUp = false;
var isToHome =  false;
var isLocal =  false;

var currentPopover;

var searchbar;
var shareHref = "";

var refresher;

var orderEnabled = false;
var selectedAllergens = {};
var selectedAllergenProduct = "";

var headerColor = null;
var footerColor = null;
var mainColor = null;
var textColor = null;

var mode;

// Check that service workers are supported
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SERVICE_WORKER);
  });
}

let deferredPrompt;
var languajes = [];
var selectedLanguaje;

window.onload = (e) => { 
	window.addEventListener('beforeinstallprompt', (e) => {
		deferredPrompt = e;
	});
	try{
        localId = window.atob(GetURLParameter('property'));
        mode = GetURLParameter('mode');
        codeLanguaje = GetURLParameter('language');
        headerColor = GetURLParameter('header');
        footerColor = GetURLParameter('footer');
        mainColor = GetURLParameter('main');
        textColor = GetURLParameter('text');

        let root = document.documentElement;

        if(codeLanguaje === undefined){
            codeLanguaje = null;
        }

        if(headerColor !== undefined){
            root.style.setProperty('--header-color', '#'+headerColor);
        }

        if(footerColor !== undefined){
            root.style.setProperty('--footer-color', '#'+footerColor);
        }

        if(mainColor !== undefined){
            root.style.setProperty('--main-color', '#'+mainColor);
        }
        if(textColor !== undefined){
            root.style.setProperty('--text-color', '#'+textColor);
        }
        
	} catch(e){
		goToHome();
    }
    var language = window.navigator.userLanguage || window.navigator.language;
    selectedLanguaje =language.substring(0,2);
    document.getElementById("flag-image").src = "./flags/"+selectedLanguaje+"-100.png"
    searchbar = document.querySelector('ion-searchbar');
    searchbar.addEventListener('ionInput', handleInputSearchBar);
    getPropertyInfo(localId);
   
    languajes = [
    {
        "code": "es",
        "name": "Spanish",
        "native": "Español"
    },{
        "code": "en",
        "name": "English",
        "native": "English"
    },
    {
        "code": "fr",
        "name": "French",
        "native": "Français"
    },
    {
        "code": "pt",
        "name": "Portuguese",
        "native": "Português"
    },
    {
        "code": "de",
        "name": "German",
        "native": "Deutsch"
    },
    {
        "code": "it",
        "name": "Italian",
        "native": "Italiano"
    },
    {
        "code": "gl",
        "name": "Galician",
        "native": "Galego"
    },
    {
        "code": "ca",
        "name": "Catalan",
        "native": "Català"
    },
    {
        "code": "eu",
        "name": "Basque",
        "native": "Euskara"
    },
    {
        "code": "aa",
        "name": "Afar",
        "native": "Afar"
    }, {
        "code": "ab",
        "name": "Abkhazian",
        "native": "Аҧсуа"
    }, {
        "code": "af",
        "name": "Afrikaans",
        "native": "Afrikaans"
    }, {
        "code": "ak",
        "name": "Akan",
        "native": "Akana"
    }, {
        "code": "am",
        "name": "Amharic",
        "native": "አማርኛ"
    }, {
        "code": "an",
        "name": "Aragonese",
        "native": "Aragonés"
    }, {
        "code": "ar",
        "name": "Arabic",
        "native": "العربية",
        "rtl": 1
    }, {
        "code": "as",
        "name": "Assamese",
        "native": "অসমীয়া"
    }, {
        "code": "av",
        "name": "Avar",
        "native": "Авар"
    }, {
        "code": "ay",
        "name": "Aymara",
        "native": "Aymar"
    }, {
        "code": "az",
        "name": "Azerbaijani",
        "native": "Azərbaycanca / آذربايجان"
    }, {
        "code": "ba",
        "name": "Bashkir",
        "native": "Башҡорт"
    }, {
        "code": "be",
        "name": "Belarusian",
        "native": "Беларуская"
    }, {
        "code": "bg",
        "name": "Bulgarian",
        "native": "Български"
    }, {
        "code": "bh",
        "name": "Bihari",
        "native": "भोजपुरी"
    }, {
        "code": "bi",
        "name": "Bislama",
        "native": "Bislama"
    }, {
        "code": "bm",
        "name": "Bambara",
        "native": "Bamanankan"
    }, {
        "code": "bn",
        "name": "Bengali",
        "native": "বাংলা"
    }, {
        "code": "bo",
        "name": "Tibetan",
        "native": "བོད་ཡིག / Bod skad"
    }, {
        "code": "br",
        "name": "Breton",
        "native": "Brezhoneg"
    }, {
        "code": "bs",
        "name": "Bosnian",
        "native": "Bosanski"
    }, {
        "code": "ce",
        "name": "Chechen",
        "native": "Нохчийн"
    }, {
        "code": "ch",
        "name": "Chamorro",
        "native": "Chamoru"
    }, {
        "code": "co",
        "name": "Corsican",
        "native": "Corsu"
    }, {
        "code": "cr",
        "name": "Cree",
        "native": "Nehiyaw"
    }, {
        "code": "cs",
        "name": "Czech",
        "native": "Česky"
    }, {
        "code": "cu",
        "name": "Old Church Slavonic / Old Bulgarian",
        "native": "словѣньскъ / slověnĭskŭ"
    }, {
        "code": "cv",
        "name": "Chuvash",
        "native": "Чăваш"
    }, {
        "code": "cy",
        "name": "Welsh",
        "native": "Cymraeg"
    }, {
        "code": "da",
        "name": "Danish",
        "native": "Dansk"
    }, {
        "code": "dv",
        "name": "Divehi",
        "native": "ދިވެހިބަސް",
        "rtl": 1
    }, {
        "code": "dz",
        "name": "Dzongkha",
        "native": "ཇོང་ཁ"
    }, {
        "code": "ee",
        "name": "Ewe",
        "native": "Ɛʋɛ"
    }, {
        "code": "el",
        "name": "Greek",
        "native": "Ελληνικά"
    }, {
        "code": "eo",
        "name": "Esperanto",
        "native": "Esperanto"
    }, {
        "code": "et",
        "name": "Estonian",
        "native": "Eesti"
    }, {
        "code": "fa",
        "name": "Persian",
        "native": "فارسی",
        "rtl": 1
    }, {
        "code": "ff",
        "name": "Peul",
        "native": "Fulfulde"
    }, {
        "code": "fi",
        "name": "Finnish",
        "native": "Suomi"
    }, {
        "code": "fj",
        "name": "Fijian",
        "native": "Na Vosa Vakaviti"
    }, {
        "code": "fo",
        "name": "Faroese",
        "native": "Føroyskt"
    }, {
        "code": "fr",
        "name": "French",
        "native": "Français"
    }, {
        "code": "fy",
        "name": "West Frisian",
        "native": "Frysk"
    }, {
        "code": "ga",
        "name": "Irish",
        "native": "Gaeilge"
    }, {
        "code": "gd",
        "name": "Scottish Gaelic",
        "native": "Gàidhlig"
    }, {
        "code": "gn",
        "name": "Guarani",
        "native": "Avañe'ẽ"
    }, {
        "code": "gu",
        "name": "Gujarati",
        "native": "ગુજરાતી"
    }, {
        "code": "gv",
        "name": "Manx",
        "native": "Gaelg"
    }, {
        "code": "ha",
        "name": "Hausa",
        "native": "هَوُسَ",
        "rtl": 1
    }, {
        "code": "he",
        "name": "Hebrew",
        "native": "עברית",
        "rtl": 1
    }, {
        "code": "hi",
        "name": "Hindi",
        "native": "हिन्दी"
    }, {
        "code": "ho",
        "name": "Hiri Motu",
        "native": "Hiri Motu"
    }, {
        "code": "hr",
        "name": "Croatian",
        "native": "Hrvatski"
    }, {
        "code": "ht",
        "name": "Haitian",
        "native": "Krèyol ayisyen"
    }, {
        "code": "hu",
        "name": "Hungarian",
        "native": "Magyar"
    }, {
        "code": "hy",
        "name": "Armenian",
        "native": "Հայերեն"
    }, {
        "code": "hz",
        "name": "Herero",
        "native": "Otsiherero"
    }, {
        "code": "ia",
        "name": "Interlingua",
        "native": "Interlingua"
    }, {
        "code": "id",
        "name": "Indonesian",
        "native": "Bahasa Indonesia"
    }, {
        "code": "ie",
        "name": "Interlingue",
        "native": "Interlingue"
    }, {
        "code": "ig",
        "name": "Igbo",
        "native": "Igbo"
    }, {
        "code": "ii",
        "name": "Sichuan Yi",
        "native": "ꆇꉙ / 四川彝语"
    }, {
        "code": "ik",
        "name": "Inupiak",
        "native": "Iñupiak"
    }, {
        "code": "io",
        "name": "Ido",
        "native": "Ido"
    }, {
        "code": "is",
        "name": "Icelandic",
        "native": "Íslenska"
    }, {
        "code": "iu",
        "name": "Inuktitut",
        "native": "ᐃᓄᒃᑎᑐᑦ"
    }, {
        "code": "ja",
        "name": "Japanese",
        "native": "日本語"
    }, {
        "code": "jv",
        "name": "Javanese",
        "native": "Basa Jawa"
    }, {
        "code": "ka",
        "name": "Georgian",
        "native": "ქართული"
    }, {
        "code": "kg",
        "name": "Kongo",
        "native": "KiKongo"
    }, {
        "code": "ki",
        "name": "Kikuyu",
        "native": "Gĩkũyũ"
    }, {
        "code": "kj",
        "name": "Kuanyama",
        "native": "Kuanyama"
    }, {
        "code": "kk",
        "name": "Kazakh",
        "native": "Қазақша"
    }, {
        "code": "kl",
        "name": "Greenlandic",
        "native": "Kalaallisut"
    }, {
        "code": "km",
        "name": "Cambodian",
        "native": "ភាសាខ្មែរ"
    }, {
        "code": "kn",
        "name": "Kannada",
        "native": "ಕನ್ನಡ"
    }, {
        "code": "ko",
        "name": "Korean",
        "native": "한국어"
    }, {
        "code": "kr",
        "name": "Kanuri",
        "native": "Kanuri"
    }, {
        "code": "ks",
        "name": "Kashmiri",
        "native": "कश्मीरी / كشميري",
        "rtl": 1
    }, {
        "code": "ku",
        "name": "Kurdish",
        "native": "Kurdî / كوردی",
        "rtl": 1
    }, {
        "code": "kv",
        "name": "Komi",
        "native": "Коми"
    }, {
        "code": "kw",
        "name": "Cornish",
        "native": "Kernewek"
    }, {
        "code": "ky",
        "name": "Kirghiz",
        "native": "Kırgızca / Кыргызча"
    }, {
        "code": "la",
        "name": "Latin",
        "native": "Latina"
    }, {
        "code": "lb",
        "name": "Luxembourgish",
        "native": "Lëtzebuergesch"
    }, {
        "code": "lg",
        "name": "Ganda",
        "native": "Luganda"
    }, {
        "code": "li",
        "name": "Limburgian",
        "native": "Limburgs"
    }, {
        "code": "ln",
        "name": "Lingala",
        "native": "Lingála"
    }, {
        "code": "lo",
        "name": "Laotian",
        "native": "ລາວ / Pha xa lao"
    }, {
        "code": "lt",
        "name": "Lithuanian",
        "native": "Lietuvių"
    }, {
        "code": "lu",
        "name": "Luba-Katanga",
        "native": "Tshiluba"
    }, {
        "code": "lv",
        "name": "Latvian",
        "native": "Latviešu"
    }, {
        "code": "mg",
        "name": "Malagasy",
        "native": "Malagasy"
    }, {
        "code": "mh",
        "name": "Marshallese",
        "native": "Kajin Majel / Ebon"
    }, {
        "code": "mi",
        "name": "Maori",
        "native": "Māori"
    }, {
        "code": "mk",
        "name": "Macedonian",
        "native": "Македонски"
    }, {
        "code": "ml",
        "name": "Malayalam",
        "native": "മലയാളം"
    }, {
        "code": "mn",
        "name": "Mongolian",
        "native": "Монгол"
    }, {
        "code": "mo",
        "name": "Moldovan",
        "native": "Moldovenească"
    }, {
        "code": "mr",
        "name": "Marathi",
        "native": "मराठी"
    }, {
        "code": "ms",
        "name": "Malay",
        "native": "Bahasa Melayu"
    }, {
        "code": "mt",
        "name": "Maltese",
        "native": "bil-Malti"
    }, {
        "code": "my",
        "name": "Burmese",
        "native": "မြန်မာစာ"
    }, {
        "code": "na",
        "name": "Nauruan",
        "native": "Dorerin Naoero"
    }, {
        "code": "nb",
        "name": "Norwegian Bokmål",
        "native": "Norsk bokmål"
    }, {
        "code": "nd",
        "name": "North Ndebele",
        "native": "Sindebele"
    }, {
        "code": "ne",
        "name": "Nepali",
        "native": "नेपाली"
    }, {
        "code": "ng",
        "name": "Ndonga",
        "native": "Oshiwambo"
    }, {
        "code": "nl",
        "name": "Dutch",
        "native": "Nederlands"
    }, {
        "code": "nn",
        "name": "Norwegian Nynorsk",
        "native": "Norsk nynorsk"
    }, {
        "code": "no",
        "name": "Norwegian",
        "native": "Norsk"
    }, {
        "code": "nr",
        "name": "South Ndebele",
        "native": "isiNdebele"
    }, {
        "code": "nv",
        "name": "Navajo",
        "native": "Diné bizaad"
    }, {
        "code": "ny",
        "name": "Chichewa",
        "native": "Chi-Chewa"
    }, {
        "code": "oc",
        "name": "Occitan",
        "native": "Occitan"
    }, {
        "code": "oj",
        "name": "Ojibwa",
        "native": "ᐊᓂᔑᓈᐯᒧᐎᓐ / Anishinaabemowin"
    }, {
        "code": "om",
        "name": "Oromo",
        "native": "Oromoo"
    }, {
        "code": "or",
        "name": "Oriya",
        "native": "ଓଡ଼ିଆ"
    }, {
        "code": "os",
        "name": "Ossetian / Ossetic",
        "native": "Иронау"
    }, {
        "code": "pa",
        "name": "Panjabi / Punjabi",
        "native": "ਪੰਜਾਬੀ / पंजाबी / پنجابي"
    }, {
        "code": "pi",
        "name": "Pali",
        "native": "Pāli / पाऴि"
    }, {
        "code": "pl",
        "name": "Polish",
        "native": "Polski"
    }, {
        "code": "ps",
        "name": "Pashto",
        "native": "پښتو",
        "rtl": 1
    }, {
        "code": "qu",
        "name": "Quechua",
        "native": "Runa Simi"
    }, {
        "code": "rm",
        "name": "Raeto Romance",
        "native": "Rumantsch"
    }, {
        "code": "rn",
        "name": "Kirundi",
        "native": "Kirundi"
    }, {
        "code": "ro",
        "name": "Romanian",
        "native": "Română"
    }, {
        "code": "ru",
        "name": "Russian",
        "native": "Русский"
    }, {
        "code": "rw",
        "name": "Rwandi",
        "native": "Kinyarwandi"
    }, {
        "code": "sa",
        "name": "Sanskrit",
        "native": "संस्कृतम्"
    }, {
        "code": "sc",
        "name": "Sardinian",
        "native": "Sardu"
    }, {
        "code": "sd",
        "name": "Sindhi",
        "native": "सिनधि"
    }, {
        "code": "se",
        "name": "Northern Sami",
        "native": "Sámegiella"
    }, {
        "code": "sg",
        "name": "Sango",
        "native": "Sängö"
    }, {
        "code": "sh",
        "name": "Serbo-Croatian",
        "native": "Srpskohrvatski / Српскохрватски"
    }, {
        "code": "si",
        "name": "Sinhalese",
        "native": "සිංහල"
    }, {
        "code": "sk",
        "name": "Slovak",
        "native": "Slovenčina"
    }, {
        "code": "sl",
        "name": "Slovenian",
        "native": "Slovenščina"
    }, {
        "code": "sm",
        "name": "Samoan",
        "native": "Gagana Samoa"
    }, {
        "code": "sn",
        "name": "Shona",
        "native": "chiShona"
    }, {
        "code": "so",
        "name": "Somalia",
        "native": "Soomaaliga"
    }, {
        "code": "sq",
        "name": "Albanian",
        "native": "Shqip"
    }, {
        "code": "sr",
        "name": "Serbian",
        "native": "Српски"
    }, {
        "code": "ss",
        "name": "Swati",
        "native": "SiSwati"
    }, {
        "code": "st",
        "name": "Southern Sotho",
        "native": "Sesotho"
    }, {
        "code": "su",
        "name": "Sundanese",
        "native": "Basa Sunda"
    }, {
        "code": "sv",
        "name": "Swedish",
        "native": "Svenska"
    }, {
        "code": "sw",
        "name": "Swahili",
        "native": "Kiswahili"
    }, {
        "code": "ta",
        "name": "Tamil",
        "native": "தமிழ்"
    }, {
        "code": "te",
        "name": "Telugu",
        "native": "తెలుగు"
    }, {
        "code": "tg",
        "name": "Tajik",
        "native": "Тоҷикӣ"
    }, {
        "code": "th",
        "name": "Thai",
        "native": "ไทย / Phasa Thai"
    }, {
        "code": "ti",
        "name": "Tigrinya",
        "native": "ትግርኛ"
    }, {
        "code": "tk",
        "name": "Turkmen",
        "native": "Туркмен / تركمن"
    }, {
        "code": "tl",
        "name": "Tagalog / Filipino",
        "native": "Tagalog"
    }, {
        "code": "tn",
        "name": "Tswana",
        "native": "Setswana"
    }, {
        "code": "to",
        "name": "Tonga",
        "native": "Lea Faka-Tonga"
    }, {
        "code": "tr",
        "name": "Turkish",
        "native": "Türkçe"
    }, {
        "code": "ts",
        "name": "Tsonga",
        "native": "Xitsonga"
    }, {
        "code": "tt",
        "name": "Tatar",
        "native": "Tatarça"
    }, {
        "code": "tw",
        "name": "Twi",
        "native": "Twi"
    }, {
        "code": "ty",
        "name": "Tahitian",
        "native": "Reo Mā`ohi"
    }, {
        "code": "ug",
        "name": "Uyghur",
        "native": "Uyƣurqə / ئۇيغۇرچە"
    }, {
        "code": "uk",
        "name": "Ukrainian",
        "native": "Українська"
    }, {
        "code": "ur",
        "name": "Urdu",
        "native": "اردو",
        "rtl": 1
    }, {
        "code": "uz",
        "name": "Uzbek",
        "native": "Ўзбек"
    }, {
        "code": "ve",
        "name": "Venda",
        "native": "Tshivenḓa"
    }, {
        "code": "vi",
        "name": "Vietnamese",
        "native": "Tiếng Việt"
    }, {
        "code": "vo",
        "name": "Volapük",
        "native": "Volapük"
    }, {
        "code": "wa",
        "name": "Walloon",
        "native": "Walon"
    }, {
        "code": "wo",
        "name": "Wolof",
        "native": "Wollof"
    }, {
        "code": "xh",
        "name": "Xhosa",
        "native": "isiXhosa"
    }, {
        "code": "yi",
        "name": "Yiddish",
        "native": "ייִדיש",
        "rtl": 1
    }, {
        "code": "yo",
        "name": "Yoruba",
        "native": "Yorùbá"
    }, {
        "code": "za",
        "name": "Zhuang",
        "native": "Cuengh / Tôô / 壮语"
    }, {
        "code": "zh",
        "name": "Chinese",
        "native": "中文"
    }, {
        "code": "zu",
        "name": "Zulu",
        "native": "isiZulu"
    }];
    
}

GetURLParameter = function (sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++){
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam){
			var code = sParameterName[1];
			code = code.replace("%3D","");
            return code;
		}
	}
};   

getPropertyInfo = function (idProperty) {
	fetchLocal(idProperty);
}; 

setPropertyInfo = function (idProperty, object){
	propertyInfo = object;
	if(propertyInfo.orderEnabled && propertyInfo.plan==="pro"){
		orderEnabled = true;
	} else {
		orderEnabled = false;
	}
	document.getElementById("propertyName").innerHTML = object.propertyName;
	//document.getElementById("callButton").href = "tel:"+object.phoneNumber;
	var text = "Ver carta de "+object.propertyName;
    shareHref = "whatsapp://send?text="+text+" "+MENU_BASE_URL+"?property="+window.btoa(idProperty);
    document.getElementById("shareButton").href=shareHref;
	document.getElementById("backButton").href=HOME;
	
	if(localStorage.getItem("local-favorites")=== null){
		if(firstTime){
			downloadCartaRequest(object.propertyName);
		}
	} else {
		var mapFavorites = JSON.parse(localStorage.getItem("local-favorites"));
		if(firstTime && mapFavorites[localId]===undefined){
			downloadCartaRequest(object.propertyName);
		} else{
			fetchMenu(localId);
		}
	}
    
};

addFavoriteLocal = function (idProperty, object){
	let mapFavorites;
	if(localStorage.getItem("local-favorites")=== null){
		mapFavorites = new Map();
	} else {
		mapFavorites = JSON.parse(localStorage.getItem("local-favorites"));
	}
	mapFavorites[idProperty]= JSON.stringify(object);
	localStorage.setItem("local-favorites",JSON.stringify(mapFavorites));
};

getCurrentLocal = function(){
	var local = null;
	if(localStorage.getItem("local-favorites")=== null){
		local = null;
	} else {
		var localString = JSON.parse(localStorage.getItem("local-favorites"))[localId];
		local = JSON.parse(localString);
	}
	return local;
}
getCurrentMenu = function (){
	var local = null;
	if(localStorage.getItem("local-menus")=== null){
		local = null;
	} else {
		var localString = JSON.parse(localStorage.getItem("local-menus"))[localId];
		if(localString === undefined){
			local = null;
		} else{
			local = JSON.parse(localString);

		}
	}
	return local;
}

setMenuInfo = function (object){
    propertyMenu = object;
	updateMenuInfo(propertyMenu);
	 
};

refresh = function (){
	fetchMenu(localId);
};

updateMenuInfo = function (menu){
	var menuContent = document.getElementById("menuContent");

    var inner = "";
    
    if(mode !== undefined && mode === "menu"){
        document.getElementById("loadingLayer").style.display="none";
		document.getElementById("menuContent").style.display="inline";
		document.getElementById("searchbarId").style.display="inline";
        document.getElementById("toolbarId").style.display="none";
        document.getElementById("footer").style.display="none";
    } else {
		document.getElementById("loadingLayer").style.display="none";
		document.getElementById("menuContent").style.display="inline";
		document.getElementById("searchbarId").style.display="inline";
        document.getElementById("toolbarId").style.display="inline";
    }

	if(propertyInfo.plan==="lowcost"){
		document.getElementById("loadingLayer").style.display="none";
		document.getElementById("menuContent").style.display="inline";
		document.getElementById("searchbarId").style.display="none";
		document.getElementById("toolbarId").style.display="inline";
		var url = menu[0].documentoUrl;
		inner = inner + `<object width="100%" height="100%" style="height=100%;width=100%" type="text/html" data="`+url+`"></object>`;	
	
	} else {

		if(menu[0].categories.length>0 || menu[0].documentoUrl===undefined){
			menu[0].categories.forEach(category => {
				if(category.enable){
					inner = inner + `<ion-list class="bg-transparent"><ion-list-header class="categoryTitle">`;
					inner = inner + category.title + `</ion-list-header>`;
					inner = inner + updateCategoryProducts(category.products);
					inner = inner + `</ion-list>`;
				}
			});
			inner = inner + `<ion-item text-center><ion-label class="ion-text-wrap" color="danger">`;
		inner = inner + menu[0].sugerencias + `</ion-label></ion-item>`;
		inner = inner + `<ion-item text-center><ion-label class="ion-text-wrap" color="danger">`;
		inner = inner + menu[0].nota + `</ion-label></ion-item>`;
		if(menu[0].documentoUrl){
			inner = inner + `<section class="full-width">
			<ion-button href="`+menu[0].documentoUrl+`" target="_blank" expand="full" color="vibrant">ABRIR CARTA EN PDF</ion-button>
		  </section>`;
			  inner = inner + `<ion-item></ion-item><ion-item></ion-item>`;
		}
	
		if(propertyInfo.plan==="pro"){
			inner = inner + `<ion-fab horizontal="end" vertical="bottom" slot="fixed">
			<ion-fab-button onclick="handleButtonClick()" color="vibrant">
			  <ion-icon name="cart-outline" color></ion-icon>
			  <ion-badge id="cart-badge2" color="vibrant2"></ion-badge>
		
			</ion-fab-button>
		  </ion-fab>`;
		}	
		} else {
			document.getElementById("searchbarId").style.display="none";
			inner = inner + `<object width="100%" height="100%" style="height=100%;width=100%" type="text/html" data="`+menu[0].documentoUrl+`"></object>`;
		}		
		
	  
	}

	menuContent.innerHTML = inner;
};

downloadCarta = function(){
	addFavoriteLocal(localId, propertyInfo);
	presentToast("Carta añadida a favoritos")
}
translateCarta = function(){
    presentToast("Traducir carta")
}

downloadCartaRequest = async function (nombreLocal) {
	firstTime = false;
	var alert = await alertController.create({
	  header: '¿Quieres añadir la carta de '+nombreLocal+" a favoritos?",
	  message: 'La tendrás accesible desde la pantalla principal',
	  buttons: [
		{
		  text: 'Cancelar',
		  role: 'cancel',
		  handler: () => {
			fetchMenu(localId);
		  }
		},
		{
		  text: 'Aceptar',
		  handler: () => {
			downloadCarta();
			fetchMenu(localId);
		  }
		}
	  ]
	});

	await alert.present();

};  

updateCategoryProducts = function(categoryProducts){
	var products = "";
	categoryProducts.forEach(prod =>{
		if(prod.enable){
			var idInput = "pvpInput"+inputCon;
			inputCon = inputCon + 1;
			var product = `<ion-item class="productItem">
			<ion-grid>
					<ion-row>
						<ion-col size=9>
							<div style="align:right;"><ion-label class="productItemTitle ion-text-wrap">`+prod.title+`
							</ion-label></div>
						</ion-col>
						<ion-col  size="3">
							<div align="right"><b class="productItemPVP">`+prod.pvp+`</b>€</div>						
						</ion-col>
					</ion-row>
				<ion-row >
					<ion-col>
						<i class="productDescription">`+prod.description+`
						</i>
					</ion-col>
				</ion-row>
				<ion-row ><ion-col>`;
				if(propertyInfo.plan==="pro") {				
					product = product+`
							<div>
								<input class="productItemCantity" type="number" id="`+idInput+`" value="0" placeHolder="Cdad." min="0" max="10000000" id="points" name="points" step="1" disabled>
							</div>
							<ion-button color="vibrant" onclick="decrement('`+idInput+`')">
								<ion-icon slot="icon-only" name="remove-circle-outline">
								</ion-icon>
							</ion-button>
							<ion-button color="vibrant" onclick="increment('`+idInput+`')">
								<ion-icon slot="icon-only" name="add-circle-outline">
								</ion-icon>
							</ion-button>
						`;
				}
					product = product +`</ion-col><ion-col><div align="right">`;

					if(prod.hasOwnProperty("alergenos") && prod.alergenos.length){
						var alerg = prod.alergenos.toString();
						alerg = alerg.replace(/,/g,'|');

						product = product + `<ion-button onclick="showAllergen('`+prod.title+`','`+alerg+`')" size="small" color="danger"">
						Alérgenos</ion-button>`;
					} ;
					product = product + `</div>
					</ion-col>
				</ion-row>
			</ion-grid>
			</ion-item>`;
			products = products + product;
		}
	});
	
	return products;
        
};

handleButtonClick = function () {
	if(!orderEnabled){
		presentToast("Este local no tiene activados los pedidos");    		
	} else if(numProductos === 0){
		presentToast("No ha seleccionado ningún producto");    		
	} else {
		//showOrderDetail();
		createModal();
	}
};

showAllergen = function (allergenProduct, allergens) {
	selectedAllergenProduct = allergenProduct;
	setSelectedAllergens(allergens.split("|"));
	const popover = Object.assign(document.createElement('ion-popover'), {
		component: 'popover-allergen-page',
		translucent: true
	  });
	  document.body.appendChild(popover);
	  return popover.present();
};

setSelectedAllergens = function (allergens){
	selectedAllergens = {};
	selectedAllergens.altramuces = "none";
	selectedAllergens.apio = "none";
	selectedAllergens.cacahuetes = "none";
	selectedAllergens.cascara = "none";
	selectedAllergens.crustaceos = "none";
	selectedAllergens.gluten = "none";
	selectedAllergens.huevos = "none";
	selectedAllergens.lacteos = "none";
	selectedAllergens.moluscos = "none";
	selectedAllergens.mostaza = "none";
	selectedAllergens.pescado = "none";
	selectedAllergens.sesamo = "none";
	selectedAllergens.soja = "none";
	selectedAllergens.sulfitos = "none";

	allergens.forEach(allergen=>{
		selectedAllergens[allergen] = "block";
	});
	

}
showOrderDetail = function () {
  const alert = document.createElement('ion-alert');
  alert.header = 'Dirección de envío';
  alert.inputs = [
    {
      name: 'name2',
      id: 'streetId',
      placeholder: 'Calle'
    },
     {
      name: 'name3',
      id: 'numberId',
      placeholder: 'Número'
    }
  ];
  alert.buttons = [

    {
      text: 'Para recoger',
      handler: () => {
        var clientAddress = "Para recoger"; 
		hacerPedido(clientAddress);
        console.log('Confirm Ok')
      }
    }, {
      text: 'Te lo llevamos',
      handler: () => {
      	var street = document.getElementById("streetId").value;
      	var number = document.getElementById("numberId").value;
      	
      	if(street === "" || number === ""){
			presentToast("Introduzca una dirección de envío");      	
      	} else {
			var clientAddress = street + ", "+number; 
			hacerPedido(clientAddress);      	
      	}
        console.log('Confirm Ok')
      }
    }
  ];

  document.body.appendChild(alert);
  return alert.present();
};

presentToast = function (text) {
  const toast = document.createElement('ion-toast');
  toast.message = text;
  toast.duration = 3000;

  document.body.appendChild(toast);
  return toast.present();
}

increment = function(id){
	numProductos = numProductos+1;
	document.getElementById(id).stepUp(1);
	updateBadge();
};

resetBadge = function(){
	numProductos = 0;
	updateBadge();
};

decrement = function(id){
	var inputValue = document.getElementById(id).value;
	if(inputValue==="0"){
		//
	} else {
		numProductos = numProductos-1;
		document.getElementById(id).stepDown(1);
		updateBadge();
	}

};

updateBadge = function () {
	var badgeContent;
	if(numProductos === 0){
		badgeContent = "";
	} else{
		badgeContent = numProductos;
    }
    var cartBadge = document.getElementById("cart-badge2");
    if(cartBadge !== null){
        cartBadge.innerHTML = badgeContent;
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

hacerPedido = function () {
       
    var address = "Para recoger";
	var street = document.getElementById("streetId").value;
	var mesa = document.getElementById("mesaId").value;
	
    if(isToHome){    	
    	address = street;
    } else if (isLocal) {
		address = mesa;
	}

	var cartaContent = document.getElementById("menuContent").children;
	var itemsPedido = Array.from(document.getElementsByClassName("carritoItem"));

	var pedido = "_Pedido_";
	if(isToHome || isPickUp){
		pedido = pedido + "\r\n\r\n*Dirección de envío: "+address+"*";
	} else {
		pedido = pedido + "\r\n\r\n*Mesa: "+address+"*";	
	}
	var empty = true;
	
	for(var i=0;i<itemsPedido.length;i++){
		var productName = itemsPedido[i].getElementsByClassName("lineaPedidoItem")[0].innerHTML;
		var indicaciones = itemsPedido[i].getElementsByClassName("indicacionesItem")[0].value;
		pedido = pedido + "\r\n\r\n"+"- "+productName+" _("+indicaciones+")_";			
	}
	
	var freeText = document.getElementById("freeText").value;
	pedido = pedido + "\r\n\r\n_"+freeText+"_";

	if(!isPickUp && !isToHome && !isLocal) {
		presentToast("Indique el modo de envío/recogida");    	
	}else if(isToHome && (street === "")) {
		presentToast("Indique una dirección de envío");    	
	}else if(isLocal && (mesa === "")) {
		presentToast("Indique la mesa o su nombre");    	
	} else {
		dismissModal();
		var encodedPedido = window.encodeURIComponent(pedido);
		window.open('whatsapp://send?text='+encodedPedido+'&phone='+propertyInfo.whatsapp+'&abid='+propertyInfo.whatsapp)
	}
}; 

getCurrentOrderInner = function () {
	var notPriceProduct = false;
	var cartaContent = document.getElementById("menuContent").children;
	var currentOrder = [];
	var total = 0;
	var innerHTML = `<ion-item>
        			<ion-label class="ion-text-wrap">[TAG_PVP]</ion-label>
     	 		</ion-item>`;

	for(var i=0;i<cartaContent.length;i++){
		if(cartaContent[i].tagName === "ION-LIST"){
			var productsContent = cartaContent[i].children;
			var carritoProductIndex = 0;
			for(var j=0;j<productsContent.length;j++){
				if(productsContent[j].tagName === "ION-ITEM"){
					var product = productsContent[j].children[0];
					var price = product.getElementsByClassName("productItemPVP")[0].innerText;
					var value = product.getElementsByClassName("productItemCantity")[0].value;
					var productName = product.getElementsByClassName("productItemTitle")[0].innerText;
					if(value === "" || value === "0"){
					} else {
					  empty = false;
					  currentOrder.push(value+" "+productName);
					  carritoProductIndex = carritoProductIndex + 1;
					  var numberPrice = Number(price.replace("€",""));
					  var numberValue = Number(value);
					  if(!isNaN(numberPrice)){
						total = total + (numberPrice*numberValue);
					  }	else{
						notPriceProduct = true;
					  }		  

					  var idProduct = "carritoProduct"+carritoProductIndex;


						  innerHTML = innerHTML + `<ion-item class="carritoItem"  id="`+idProduct+`">
						  <ion-grid>
								<ion-row>
								  <h4 class="lineaPedidoItem">`+value+" "+productName+`</h4>
							  	</ion-row>
							  	<ion-row>
							  		<ion-input class="indicacionesItem" placeholder="Indicaciones"></ion-input>
							  	</ion-row>
							</ion-grid>
						</ion-item>`;

					}	
					
				}
			}
		}
	}
	if(!notPriceProduct){
		innerHTML = innerHTML.replace("[TAG_PVP]","TOTAL: "+total+"€");
	} else {
		innerHTML = innerHTML.replace("[TAG_PVP]","TOTAL: "+total+"€ - No incluye todo el pedido. Consultar con el establecimiento");
	}
	return innerHTML;
	
}

function removeCarritoItem(id){
	document.getElementById(id).remove();
}

handleLanguajeButtonInfoClick = async function handleLanguajeButtonInfoClick(ev) {
    popover = await popoverController.create({
      component: 'popover-languaje-page',
      event: ev,
      translucent: true
    });
    currentPopover = popover;
    return popover.present();
  }

  function dismissPopover() {
    if (currentPopover) {
      currentPopover.dismiss().then(() => { currentPopover = null; });
    }
  };

  customElements.define('popover-languaje-page', class ModalContent extends HTMLElement {
    connectedCallback() {
      var infoString = `<ion-list><ion-list-header>Select Languaje</ion-list-header>`;  

      languajes.forEach(languaje=>{
        infoString = infoString+`<ion-item><ion-label onclick="translateTo('`+languaje.code+`')"><h2>`+languaje.name+`</h2><h3>`+languaje.native+`</h3><p>`+languaje.code+`</p></ion-label></ion-item>` ;
      });
      this.innerHTML = infoString+"</ion-list>";
    }
  });

translateTo = function(){
    codeLanguaje = selectedLanguaje;
    fetchMenu(localId);
}

handleButtonInfoClick = async function handleButtonInfoClick(ev) {
      popover = await popoverController.create({
        component: 'popover-info-page',
        event: ev,
        translucent: true
      });
      currentPopover = popover;
      return popover.present();
    }

    function dismissPopover() {
      if (currentPopover) {
        currentPopover.dismiss().then(() => { currentPopover = null; });
      }
    };

 customElements.define('popover-info-page', class ModalContent extends HTMLElement {
      connectedCallback() {
        var infoString = `<ion-list><ion-list-header>`+propertyInfo.propertyName+`- Información</ion-list-header>`;        
      	if(propertyInfo.homeDelivery){
			infoString = infoString +  `<ion-item><ion-icon name="home-outline"></ion-icon><p>Envío a domicilio</p></ion-item>`;     	
      	}
      	if(propertyInfo.card){
			infoString = infoString +  `<ion-item><ion-icon name="card-outline"></ion-icon><p>Pago con tarjeta</p></ion-item>`;     	   	
      	}
      	if(propertyInfo.cash){
			infoString = infoString +  `<ion-item><ion-icon name="cash-outline"></ion-icon><p>Pago en efectivo</p></ion-item>`;     	   	
      	}

      	infoString = infoString+`<ion-item><ion-icon name="alarm-outline"></ion-icon><p>`+propertyInfo.timeTable+`</p></ion-item>`; 
		var location = propertyInfo.longitude+","+propertyInfo.latitude;
		infoString = infoString + `<ion-item button href="https://www.google.com/maps/search/?api=1&query=`+location+`" target="_blank"><ion-icon name="location-outline"></ion-icon><p>Ubicación</p></ion-item>`; 
		infoString = infoString + `<ion-item button href="tel:`+propertyInfo.phoneNumber+`"><ion-icon name="call-outline"></ion-icon><p>`+propertyInfo.phoneNumber+`</p></ion-item> `
		infoString = infoString+`<ion-item lines="none" detail="false" button onClick="dismissPopover()">Cerrar</ion-item></ion-list>`;

        this.innerHTML = infoString;
      }
	});

	customElements.define('popover-allergen-page', class ModalContent extends HTMLElement {
		connectedCallback() {

		  var infoString = `<ion-list>
		  <ion-list-header>
			`+selectedAllergenProduct+`
		  </ion-list-header>
  
		  	<ion-item lines="none" style="display:`+selectedAllergens.altramuces+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/altramuces.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Altramuces</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.apio+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/apio.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Apio</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.cacahuetes+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/cacahuetes.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Cacahuetes</h3>
				</ion-label>
			  </ion-item>
				  
			  <ion-item lines="none" style="display:`+selectedAllergens.cascara+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/cascara.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Cáscara</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.crustaceos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/crustaceos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Crustaceos</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.gluten+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/gluten.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Gluten</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.huevos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/huevos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Huevos</h3>
				</ion-label>
			  </ion-item>

			  <ion-item lines="none" style="display:`+selectedAllergens.lacteos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/lacteos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Lácteos</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.moluscos+`">
		  		<ion-avatar slot="start">
		  			<img src="./images/moluscos.png">
				</ion-avatar>
				<ion-label>
			  		<h3>Moluscos</h3>
				</ion-label>
			  </ion-item>
			  
			  <ion-item lines="none" style="display:`+selectedAllergens.mostaza+`">
			  	<ion-avatar slot="start">
					<img src="./images/mostaza.png">
				</ion-avatar>
				<ion-label>
				  <h3>Mostaza</h3>
				</ion-label>
		  		</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.pescado+`">
					<ion-avatar slot="start">
						<img src="./images/pescado.png">
					</ion-avatar>
					<ion-label>
						<h3>Pescado</h3>
					</ion-label>
				</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.sesamo+`">
					<ion-avatar slot="start">
						<img src="./images/sesamo.png">
					</ion-avatar>
					<ion-label>
						<h3>Sésamo</h3>
					</ion-label>
				</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.soja+`">
					<ion-avatar slot="start">
						<img src="./images/soja.png">
					</ion-avatar>
					<ion-label>
						<h3>Soja</h3>
					</ion-label>
				</ion-item>

				<ion-item lines="none" style="display:`+selectedAllergens.sulfitos+`">
					<ion-avatar slot="start">
						<img src="./images/sulfitos.png">
					</ion-avatar>
					<ion-label>
						<h3>Sulfittos</h3>
					</ion-label>
				</ion-item>
		  
		  </ion-list>`
		  this.innerHTML = infoString;
		}
	  });

//DATA

const fetchLocal = (local) => {
    showLoading("Cargando el local");
		return axios.get(API_PATH+local,{ crossdomain: true })
        .then(response => {
            hideLoading();
			if(isEmpty(response.data)){
				goToHome();		
			} else{
        		setPropertyInfo(local, response.data);	
			}
        })
        .catch(error => {
			hideLoading();
			goToHome();

		});
	
    
};

const fetchMenu = (local) => {
    showLoading("Cargando la carta");
    var url = API_PATH+local+"/menu";
    if(codeLanguaje !== null){
        url = url+"/?languaje="+codeLanguaje;
    }

		return axios.get(url,{ crossdomain: true })
			.then(response => {
				hideLoading();
				resetBadge();
				if(isEmpty(response.data)){
					hideLoading();
				} else{
					setMenuInfo(response.data);	   
					hideLoading();     				
				}
			})
			.catch(error => {
				hideLoading();
				//goToHome();
			});
	
};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
};

function goToHome(){
	window.location.href = HOME;
};


    customElements.define('modal-content', class ModalContent extends HTMLElement {
      connectedCallback() {
      	var currentOrder = getCurrentOrderInner();
		var inner = "";
        inner= `
          <ion-header translucent>
            <ion-toolbar color="vibrant2">
              <ion-title>Mi Pedido</ion-title>
              <ion-buttons slot="end">
                <ion-button onclick="dismissModal()">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content fullscreen>
            <ion-list>
				 <ion-radio-group mode=md value="sendType" >
				 	<ion-item class="typeSendInput" onclick="inLocal()">
            			<ion-label >Estoy en el local</ion-label>
            			<ion-radio slot="start" color="vibrant" value="local" ></ion-radio>
          			</ion-item>
					<ion-item class="typeSendInput" onclick="pickUp()">
            			<ion-label >Recoger en el local</ion-label>
            			<ion-radio slot="start" color="vibrant" value="recoger" ></ion-radio>
          			</ion-item>
					<ion-item class="typeSendInput" onclick="sendHome()">
            			<ion-label>Enviar a casa</ion-label>
						<ion-radio slot="start" color="vibrant" value="enviar"`;

						if(!propertyInfo.homeDelivery){
							inner = inner + " disabled";
						}
						
						inner = inner+`></ion-radio>
          			</ion-item>
                  </ion-radio-group>
         		<form class="formAddressDisable" id="formAddress">
      				<ion-item>
						<ion-textarea id="streetId" placeholder="Dirección"></ion-textarea>
      				</ion-item>
				</form>
				<form class="formMesaDisable" id="formMesa">
					<ion-item>
						<ion-textarea id="mesaId" placeholder="Mesa / Nombre"></ion-textarea>
			 	 	</ion-item>
    	  		</form>
				  
				<ion-item>
  					<ion-textarea id="freeText" placeholder="Coméntanos lo que quieras"></ion-textarea>
				</ion-item>
				`+currentOrder+`</ion-list>
          </ion-content>
          <ion-footer>
		<div class="horizontal div1">
    		<div class="vertical">
        	<ion-button expand="block" onclick="hacerPedido()" color="vibrant">Pedir por Whatsapp</ion-button>
   			 </div>
		</div>

	</ion-footer>
		`;
		this.innerHTML = inner;
      }
    });

var currentModal = null;

async function createModal() {
	const modal = await modalController.create({
	component: 'modal-content'
	});
	await modal.present();
	currentModal = modal;
};

function dismissModal() {
	if (currentModal) {
        currentModal.dismiss().then(() => { currentModal = null; });
	}
};

function sendHome(){
	isToHome =  true;
	isPickUp = false;
	isLocal = false;
	document.getElementById("formAddress").className="formAddressEnable";
	document.getElementById("formMesa").className="formMesaDisable";

};

function pickUp(){
	isToHome =  false;
	isPickUp = true;
	isLocal = false;
	document.getElementById("formAddress").className="formAddressDisable";
	document.getElementById("formMesa").className="formMesaDisable";

};

function inLocal(){
	isToHome =  false;
	isPickUp = false;
	isLocal = true;
	document.getElementById("formAddress").className="formAddressDisable";
	document.getElementById("formMesa").className="formMesaEnable";

};


    function handleInputSearchBar(event) {
      var items = Array.from(document.getElementsByClassName("productItem"));

      var query = event.target.value.toLowerCase();
      requestAnimationFrame(() => {
        items.forEach(item => {
          var productLabel = item.children[0].children[0].textContent;
          var shouldShow = productLabel.toLowerCase().indexOf(query) > -1;
          item.style.display = shouldShow ? 'block' : 'none';
        });
      });
    }

