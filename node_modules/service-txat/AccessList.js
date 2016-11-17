"use strict"

/**
 * Access : classe gérant une liste d'access utilisateur
 */
class AccessList {
	constructor() {
		this.oList = {};
	}
	
	/**
	 * Renvoie le timestamp
	 * @return int
	 */
	getDate() {
		return Date.now();
	}
	
	/**
	 * Indique le nombre d'utilisateur enregistrés
	 * @return int
	 */
	getUserCount() {
		return Object.keys(this.oList).length;
	}
	
	/**
	 * Ajoute un utilisateur à la liste
	 * @param string sName nom de connexion de l'utilisateur
	 */
	addUser(sName, dUntil) {
		if (dUntil === undefined) {
			dUntil = 0;
		}
		this.oList[sName] = dUntil;
	}
	
	/**
	 * Supprime un user de la list
	 * @param string sName nom de connexion de l'utilisateur
	 */
	removeUser(sName) {
		if (sName in this.oList) {
			delete this.oList[sName];
		}
	}

	/**
	 * Verifie la présence et la validité du nom d'user dans une liste
	 * @return bool true = valide
	 */
	isUserListed(sName) {
		if (sName in this.oList) {
			if (this.oList[sName] === 0) {
				return true;
			}
			if (this.oList[sName] > this.getDate()) {
				return true;
			}
		}
		return false;
	}
}

module.exports = AccessList;
