"use strict"

var Mediator = require('mediator');
var Plugin = Mediator.Plugin;

class AuthPlugin extends Plugin {
	
	constructor() {
		super();
		this.aSuperAdmin = null;
	}
	
	init() {
		this.register('configAuth');
		this.register('userJoined');
	}
	
	configAuth(oConfig) {
		this.aSuperAdmin = oConfig.superadmin;
	}
	
	userJoined(oChannel, oUser) {
		if (this.aSuperAdmin.indexOf(oUser.sName) >= 0) {
			oUser.oPowers[oChannel.id].preset(3);
		}
	}
}

module.exports = AuthPlugin;
