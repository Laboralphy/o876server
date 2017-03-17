O2.createClass('WSC.ApplicationAbstract', {

	_socket: null, // objet socket client de connexion

	/**
	 * Toutes les methode commencant par "net_" doivent correspondre
	 * a un message réseau venant du serveur
	 * Ici on les associe à un écouteur
	 */
	_registerSocketMethods: function(sPrefix) {
		var r;
		var regex = new RegExp('^' + sPrefix + '([_a-z0-9]+)$', 'i');
		for (var sMeth in this) {
			r = sMeth.match(regex);
			if (r) {
				this._socket.on(r[1], this[sMeth].bind(this));
			}
		}
	},
	
	getSocket: function() {
		return this._socket;
	},
	
	/**
	 * Initie la connexion au server 
	 * Utilise les données affichées dans la bar de location
	 */
	_connect: function() {
		var sIP = location.hostname;
		var sPort = location.port;
		var sProto = location.protocol;
		this._socket = io.connect(sProto + '//' + sIP + ':' + sPort + '/');
	}
});
