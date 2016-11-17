/**
 * Classe de réaction cliente à une connexion au serveur Kaode
 */

O2.extendClass('Application', ApplicationAbstract, {

	
	sUserName: '', // nom de l'utilisateur connecté
	sUserId: '', // identifiant de l'utilisateur connecté
	
	oChannelUsers: null, // listte des canaux de discussion
	sCurrentChannel: '', // liste du canal courant
	// pour cette mini classe on restera dans le seul canal du serveur "general"
	// mais la classe de txat en gère plusieurs
	
	
	
	/**
	 * Initialisation de l'application
	 */
	init: function() {
		this.loadMenu('main-menu-0.html');
		$(window).on('resize', View.resizeScreen);
	},

	/**
	 * charge un template de menu
	 * @param s string nom du template
	 * @return object instance de xhr
	 */
	loadMenu: function(s) {
		return this.load(s, $('.kaode-menu'));
	},

	/**
	 * charge un template de page principale
	 * @param s string nom du template
	 * @return object instance de xhr
	 */
	load: function(sURL, oAnchor) {
		return __inherited(sURL, oAnchor).success(function() {
			$(window).trigger('resize');
		});
	},
	
	/**************************************************************
	 * 
	 *                       A C T I O N S
	 * 
	 * Les action sont invoqué par généralement par des actions
	 * utilisateurs comme le pressage de bouton...
	 **************************************************************/
	
	/**
	 * Affichage du formulaire de Connection du client au serveur
	 */
	formConnectAction: function() {
		// affichage du formualire de login
		$app = $('#application');
		this.load('form-login.html', $app);
	},

	/**
	 * Connection effective du client
	 */
	connectAction: function() {
		if (this.oClientSocket) {
			throw new Error('Déjà connecté.');
		}
		$form = $('form[name="form-login"]');
		$login = $('input[name="login"]', $form);
		$id = $('input[name="id"]', $form);
		var sLogin = $login.val();
		var sId = $id.val();
		if (sLogin == '' || sId == '') {
			throw new Error('Mauvais login ou identifiant.');
		}
		this.sUserName = sLogin;
		this.sUserId = sId;
		this.oChannelUsers = {};
		this.load('login-wait.html', $('#application')).then(this._connectToServer.bind(this));
	},
	
	/**
	 * Déconnexion du client
	 */
	disconnectAction: function() {
		if (this.oClientSocket) {
			this.oClientSocket.disconnect();
			this.oClientSocket = null;
			this.loadMenu('main-menu-0.html');
			this.load('form-login.html', $app);
		} else {
			throw new Error('Pas encore connecté.');
		}
	},
	

	showChatAction: function() {
		View.showSection('chat');
		View.resizeScreen();
	},
	
	/////////////////// FIN DES ACTIONS ////////////////////






	/*************************************************
	 *
	 *      P R I V A T E   M E T H O D S 
	 *
	 *************************************************/


	
	/**
	 * Action par défault pour tous les bouton
	 * Lecture de la data-action et lancement de la methode correspondante
	 */
	_actionOnClick: function(oEvent) {
		var oElem = oEvent.target;
		try {
			var $elem = $(oElem);
			var sAction = $elem.data('action');
			if (sAction) {
				this[sAction + 'Action'](oEvent);
			}
		} catch (e) {
			View.error(e);
		}
	},

	/**
	 * Chargement d'un template
	 * Prend en compte les boutons pour ajouter un handler de click
	 * @param sURL url du template
	 * @param oAnchor DOMElement sur lequel sera accroché le contenue chargé
	 * @return object Ajax
	 */
	load: function(sURL, oAnchor, bAppend) {
		return $.get('templates/' + sURL).success((function(data) {
			var $data = $(data);
			var $anchor = $(oAnchor);
			if (!bAppend) {
				$anchor.empty()
			}
			$anchor.append($data);
			// les boutons
			$('a.btn', $data).on('click', this._actionOnClick.bind(this));
		}).bind(this)).fail(function(data, err) {
			View.error(data.status + ' - ' + data.statusText);
		});
	},
	
	 
	/****************************************************
	 *
	 * MESSAGE CLIENT VERS SERVEUR
	 *
	 ****************************************************/

	/**
	 * Envoi d'une demande de login
	 */
	send_LOGIN: function(sUserName, sID) {
		this.oClientSocket.send('LOGIN', {u: sUserName, p: sID});
	},

	/**
	 * Envoi d'un message de discussion au serveur
	 */ 
	send_T_SAY: function(sMessage) {
		this.oClientSocket.send('T_SAY', {m: sMessage, c: this.sCurrentChannel});
	},
	
	


	/****************************************************
	 *
	 * RECEPTION DE MESSAGES SERVEURS
	 *
	 ****************************************************/

	
	/**
	 * Connexion réussie
	 * On lance l'authentification
	 */
	net_connect: function() {
		this.loadMenu('main-menu-cnx.html');
		this.load('main-screen.html', $('#application')).success((function () {
			View.showSection('chat');
			this.send_LOGIN(this.sUserName, this.sUserId);
			$('.command input').on('keydown', (function(oEvent) {
				switch (oEvent.which) {
					case 13:
						this.send_T_SAY(oEvent.target.value);
						oEvent.target.value = '';
						break;
				}
			}).bind(this));
		}).bind(this));
	},
	
	/**
	 * Déconnexion inopinée
	 */
	net_disconnect: function() {
		$('body').empty();
		View.error('Déconnecté !');
	},
	
	/**
	 * Message de bienvenue du serveur : on est correctement identifié
	 */
	net_HI: function() {
		this.oClientSocket.send('T_LIST');
	},

	/**
	 * Notre connexion a été refusée
	 * @param data.e string message d'erreur
	 */
	net_DN: function(data) {
		View.error(data.e);
	},
	
	/**
	 * Le serveur a envoyé une liste de canaux disponnible
	 * Et pour lesquels le client à le droit de se connecter
	 * @param data.c array of string : liste des canaux
	 */
	net_T_LS: function(data) {
		View.setChanList(data.c);
	},
	
	/**
	 * Nouvel arrivant dans un canal de discussion
	 * @param data.u string nouvel arrivant
	 * @param data.c string canal sur lequel l'arrivant arrive	
	 */
	net_T_CA: function(data) {
		if (data.u == this.sUserName) {
			this.sCurrentChannel = data.c;
		}
		if (!(data.c in this.oChannelUsers)) {
			this.oChannelUsers[data.c] = [];
		}
		var aChan = this.oChannelUsers[data.c];
		if (aChan.indexOf(data.u) < 0) {
			aChan.push(data.u);
		}
		View.termPrint('<b>' + data.u + '</b> arrive dans le canal <b>' + data.c + '</b>');
		if (this.sCurrentChannel == data.c) {
			View.setUserList(this.oChannelUsers[data.c]);
		}
	},

	/**
	 * Un client quitte un canal de discussion
	 * @param data.u string client partant
	 * @param data.c string canal sur lequel le départ A lieu	
	 */
	net_T_CD: function(data) {
		View.termPrint('<b>' + data.u + '</b> quitte le canal <b>' + data.c + '</b>');
	},

	/**
	 * Liste des utilisateur d'un canal
	 * @param data.u array of string : liste
	 * @param data.c string canal concerné
	 */
	net_T_CL: function(data) {
		this.oChannelUsers[data.c] = data.u;
		if (this.sCurrentChannel == data.c) {
			View.setUserList(data.u);
		}
	},

	/**
	 * Message de discussion
	 * @param data.u string utilisateur ayant emis le message
	 * @param data.c string canal sur lequel le message est diffusé
	 * @param data.m string contenu du message
	 * @param data.d object : objet supplémentaire pouvant contenir des données issues de plugins
	 */
	net_T_CM: function(data) {
		if (data.c == this.sCurrentChannel) {
			View.termPrint('<b>' + data.u + ' : </b>' + data.m);
		}
	},

	/**
	 * Message d'information du serveur'
	 * @param data.c string canal sur lequel le message est diffusé
	 * @param data.m string contenu du message
	 */
	net_T_IM: function(data) {
		if (data.c == this.sCurrentChannel) {
			View.termPrint('<i>' + data.m + '</i>');
		}
	},
	
	
});


O2.mixin(Application, O876.Mixin.Events);
O2.mixin(Application, O876.Mixin.Data);
