/**
 * Classe de recyclage des identifiants 
 */
"use strict"
class Recycler {
	constructor() {
		this.aIds = null;
		this.nLastId = 0;
		this.reset();
	}
	
	/**
	 * Remet le systeme à zero
	 */
	reset() {
		this.aIds = [];
		this.nLastId = 0;
	}
	
	/**
	 * Renvoie un nouvel id
	 * @return int
	 */
	getId() {
		if (this.aIds.length) {
			return this.aIds.shift();
		} else {
			return ++this.nLastId;
		}
	}
	
	/**
	 * Jette un id
	 * @param int id identifiant à jeter
	 */
	disposeId(id) {
		this.aIds.push(id);
	}
}

module.exports = Recycler;
