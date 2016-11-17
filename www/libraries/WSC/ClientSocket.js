O2.createObject('WSC.ClientSocket', {
	/**
	 * Initie la connexion au server 
	 * Utilise les données affichées dans la barre de location
	 * @return Socket
	 */
	connect: function() {
		var sIP = location.hostname;
		var sPort = location.port;
		var sProto = location.protocol;
		return io.connect(sProto + '//' + sIP + ':' + sPort + '/');
	}
});
