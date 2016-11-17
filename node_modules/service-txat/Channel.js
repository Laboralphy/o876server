"use strict"
var AccessList = require('./AccessList.js');
var ArrayTools = require('./ArrayTools.js');

/**
 * Channel : classe gérant un canal de discussion
 */
class Channel {

	constructor() {
		this.id = 0; // identifiant de canal dans le systeme
		this.sName = ''; // nom du canal
		this.aUsers = []; // Liste des utilisateurs connectés au canal
		this.oWhiteList = new AccessList(); // Liste d'utilisateurs (nom) pouvant se connecter
		this.oBlackList = new AccessList(); // Liste d'utilisateurs (nom) ne pouvant pas se connecter
		this.bPublic = true; // canal public
		this.bPermanent = true; // canal qui persiste même vide
		this.oBannedWhy = {}; // Pourquoi les utilisateurs sont bannis
	}
	
	/**
	 * Défini le nom du canal
	 * @param string sName
	 */
	setName(sName) {
		this.sName = sName;
	}
	
	getName() {
		return this.sName;
	}
	
	/**
	 * Renvoie le nombre d'utilisateurs connectés au canal
	 * @return int
	 */
	getUserCount() {
		return this.aUsers.length;
	}
	
	/**
	 * Renvoie la liste des utilisateurs du canal
	 * @return object
	 */
	getUserList() {
		return this.aUsers;
	}

	/**
	 * Inscrit un utilisateur en liste noire. A l'issue de la date
	 * spécifiée, l'utilisateur peut à nouveau se reconnecter
	 * @param string sName nom de connexion de l'utilisateur
	 * @param int dUntil date à laquelle le retour est possible (timestamp)
	 */
	addUserToBlackList(sName, dUntil, sWhy) {
		this.oBlackList.addUser(sName, dUntil);
		this.oBannedWhy[sName] = sWhy;
	}

	/**
	 * Supprime un user de la black list (pour le débannir par exemple)
	 * @param string sName nom de connexion de l'utilisateur
	 */
	removeUserFromBlackList(sName) {
		this.oBlackList.removeUser(sName);
		delete this.oBannedWhy[sName];
	}
	
	getBanReport(sName, sSep) {
		var sReason = 'not specified';
		var sUntil = 'a moderator cancels the ban';
		if (this.oBannedWhy[sName]) {
			sReason = this.oBannedWhy[sName];
		}
		var oReport;
		if (this.oBlackList.isUserListed(sName)) {
			var nTime = this.oBlackList.oList[sName];
			if (nTime) {
				var d = new Date(nTime);
				sUntil = d.toString();
			}
			oReport = {reason: sReason, until: sUntil};
		} else if ((!this.isPublic()) && (!this.oWhiteList.isUserListed(sName))) {
			oReport = {reason: 'channel is private'};
		}
		if (sSep) {
			var sReport = '';
			for (var r in oReport) {
				sReport += sSep + r + ': ' + oReport[r];
			}
			return sReport;
		} else {
			return oReport;
		}
	}
	
	getBanReports(sSep) {
		var oReport = {};
		for (var sUser in this.oBlackList.oList) {
			oReport[sUser] = this.getBanReport(sUser, sSep);
		}
		return oReport;
	}
	
	/**
	 * Inscrit un utilisateur en liste blanche. A l'issue de la date
	 * spécifiée, l'utilisateur perd son access au canal.
	 * L'inscription en liste blanche est possible même si l'utilisateur
	 * est inscrit en liste noire, mais la liste noire est prioritaire
	 * Le canal devient privé si au moins un utilisateur est inscrit dans cette liste
	 * @param string sName nom de connexion de l'utilisateur
	 * @param int dUntil date à laquelle le nom est rayé de la liste (timestamp)
	 */
	addUserToWhiteList(sName, dUntil) {
		this.oWhiteList.addUser(sName, dUntil);
		this.bPublic = false;
	}
	
	/**
	 * Supprime un user de la white list (il quitte la guilde par exemple)
	 * @param string sName nom de connexion de l'utilisateur
	 */
	removeUserFromWhiteList(sName) {
		this.oWhiteList.removeUser(sName);
		this.bPublic = this.oWhiteList.getUserCount() == 0;
	}
	
	
	/**
	 * Renvoie true si le canal est public (whitelist vide)
	 * @return bool
	 */
	isPublic() {
		return this.bPublic;
	}
	

	/**
	 * Détermine si un utilisateur est autorisé à se connecter
	 * Utilise la date système.
	 * @param string sName nom de l'utilisateur
	 * @return bool true = access autorisé
	 */
	isUserAccessGranted(sName) {
		if (this.oBlackList.isUserListed(sName)) {
			return false;
		}
		if (this.isPublic()) {
			return true;
		}
		if (this.oWhiteList.isUserListed(sName)) {
			return true;
		}
		return false;
	}
	
	/**
	 * Ajoute un utilisateur au canal
	 * Donne les droits Admin a l'utilisateur si il n'y a
	 * personne dans le canal.
	 * @param int idUser identifiant user
	 * @thorws errTxat channel duplicate user
	 * en cas de duplication d'utilisateur
	 */
	addUser(oUser) {
		var idUser = oUser.id;
		var sName = oUser.getName();
		var bAdmin = this.getUserCount() == 0;
		var bGranted = this.isUserAccessGranted(sName);
		if (bGranted) {
			if (this.aUsers.indexOf(idUser) >= 0) {
				throw new Error('User ' + oUser.sName + ' is already registrered in this channel');
			}
			oUser.grantPowers(this.id, bAdmin);
			this.aUsers.push(idUser);
		}
		return bGranted;
	}

	/**
	 * Supprime un utilisateur du canal
	 * @param int idUser identifiant user
	 */
	removeUser(oUser) {
		var u = this.aUsers;
		var i = u.indexOf(oUser.id);
		if (i >= 0) {
			ArrayTools.removeItem(u, i);
			oUser.stripPowers(this.id);
		} else {
			throw new Error('User ' + oUser.sName + ' is not in the channel');
		}
	}
}

module.exports = Channel;
