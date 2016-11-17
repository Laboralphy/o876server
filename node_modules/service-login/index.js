////// SERVICE LOGIN ////// SERVICE LOGIN ////// SERVICE LOGIN ////// SERVICE LOGIN //////
////// SERVICE LOGIN ////// SERVICE LOGIN ////// SERVICE LOGIN ////// SERVICE LOGIN //////
////// SERVICE LOGIN ////// SERVICE LOGIN ////// SERVICE LOGIN ////// SERVICE LOGIN //////

/**
 * Service gérant l'accueil et le recensement des clients qui se connecte
 * Effectue l'authentification et l'attribution d'un identifiant de connexion a chaque socket
 * Propose une fonction de récupération de socket a partir de l'identifiant
 */ 

var wsh = require('wshelper');
var http = require('httphelper');

var oEmitter;

var nIdRegistryKey = 0;

var oUserNames = {};
var oUserTable = {};

/**
 * Iniitialisation des registre des clients
 */
function init() {
	nIdRegistryKey = 0;
}

/**
 * Rapporte une erreur
 */
function errorLog(e) {
	http.writeLog('[err login] ' + e.message);
}

/**
 * Récupération d'un identifiant de connexion
 * @return int
 */
function getUserAuth(sUser, sPass) {
	if (sUser in oUserNames) {
		throw new Error('already connected : "' + sUser + '"');
	}
	var id = ++nIdRegistryKey;
	oUserNames[sUser] = id;
	var oAuth = {
		name: sUser,
		id: id
	};
	oUserTable[id] = oAuth;
	return oAuth;
}


/**
 * Fonction de service
 */
function service(oSocket) {

	oSocket.on('disconnect', function() {
		try {
			if (wsh.checkSession(oSocket)) {
				// signaler la déconnexion au server auth
				var id = wsh.getSocketId(oSocket);
				if (id) {
					var oAuth = oUserTable[id];
					var sName = oAuth.name;
					oEmitter.emit('disconnect', oAuth);
					delete oUserNames[sName];
					delete oUserTable[id];
				}
			}
		} catch (e) {
			errorLog(e);
		}
	});

	/**
	 * demande d'authentification
	 * T_LOGIN 
	 * - u: string, pseudonyme soumit par l'utilisateur
	 * - p: string, mot de passe ou identifiant
	 */
	oSocket.on('LOGIN', function(xData) {
		try {
			var sUserName = xData.u;
			var sPass = 'p' in xData ? xData.p : '';
			var oAuth = getUserAuth(sUserName, sPass);
			wsh.setSocketId(oSocket, oAuth.id);
			wsh.send([oSocket], 'HI', {u: oAuth.name});
			oEmitter.emit('auth', oAuth);
		} catch (e) {
			errorLog(e);
			wsh.send([oSocket], 'DN', {e: e.toString()});
		}
	});
}

function setEmitter(e) {
	oEmitter = e;
}

module.exports = {
	service: service,
	init: init,
	emitter: setEmitter
};
