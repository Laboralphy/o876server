O2.createClass('ApplicationAbstract', {

	_oClientSocket: null, // objet socket client de connexion

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
				this._oClientSocket.setSocketHandler(r[1], this[sMeth].bind(this));
			}
		}
	},
	
	getSocket: function() {
		if (!this._oClientSocket) {
			this._oClientSocket = new WSC.ClientSocket();
		}
		return this._oClientSocket;
	},
	
	_connectToServer: function() {
		this.getSocket().connect();
		this._registerNetworkHandlers();
	},
	

});
