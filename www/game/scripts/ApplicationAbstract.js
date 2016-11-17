O2.createClass('ApplicationAbstract', {

	oClientSocket: null, // objet socket client de connexion

	/**
	 * Toutes les methode commencant par "net_" doivent correspondre
	 * a un message réseau venant du serveur
	 * Ici on les associe à un écouteur
	 */
	_registerNetworkHandlers: function() {
		var r;
		for (var sMeth in this) {
			r = sMeth.match(/^net_([_a-z0-9]+)$/i);
			if (r) {
				this.oClientSocket.setSocketHandler(r[1], this[sMeth].bind(this));
			}
		}
	},
	
	_connectToServer: function() {
		this.oClientSocket = new WSC.ClientSocketAbstract();
		this.oClientSocket.connect();
		this._registerNetworkHandlers();
	},
	

});
