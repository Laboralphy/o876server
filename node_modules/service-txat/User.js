"use strict"
var Powers = require('./Powers.js');

/**
 * User : classe gérant un utilisateur
 */
class User {
	constructor() {
		this.id = 0;				// identifiant de connexion dans le systeme
		this.sName = '';			// nom de login
		this.sDisplayName = '';	// Nom affiché
		this.oPowers = {};		// Liste des droits d'access
	}
	
	getName() {
		return this.sName;
	}
	
	getDisplayName() {
		if (this.sDisplayName) {
			return this.sDisplayName;
		} else { 
			return this.sName;
		}
	}

	setDisplayName(s) {
		this.sDisplayName = s;
	}
	
	/**
	 * Fait rejoindre le user dans un canal
	 * Lui octroi des droit standars sauf s'il est admin
	 * @param int idChannel idetifiant canal
	 * @param bool bAsAdmin true = prendre un profil admin
	 */
	grantPowers(idChannel, bAsAdmin) {
		var p = new Powers();
		if (this.bSuperAdmin) {
			p.preset(3);
		} else if (bAsAdmin) {
			p.preset(2);
		} else {
			p.preset(0);
		}
		this.oPowers[idChannel] = p;
	}
	
	/**
	 * Supprime les pouvoirs de l'utilisaeur lié au canal spécifié
	 * @param int idChannel
	 */
	stripPowers(idChannel) {
		delete this.oPowers[idChannel];
	}
	
	/**
	 * Renvoie la liste des canaux auquel l'utilisateur est connecté
	 * @return array
	 */
	getChannelList() {
		return Object.keys(this.oPowers).map(function(i, n, a) {
			return i | 0;
		});
	}
}

module.exports = User;
