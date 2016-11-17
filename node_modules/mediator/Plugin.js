"use strict"

/**
 * Classe abstraite de Plugin
 * A étendre pour créer un vrai plugin.
 */ 
class Plugin {
	constructor() {
		this._oMediator = null;
	}
	
	/**
	 * Le plugin peut contenir une fonction init() qui
	 * sera invoqué dés que le plugin sera branché au mediateur
	 */
	
	/**
	 * Permet d'enregistrer un certain type de signal que le plugin va gérer
	 * auprès du médiateur
	 * @param string sType type de signal (envoyé par l'application)
	 */
	register(sType) {
		this._oMediator.registerPluginSignal(sType, this);
	}
	
	/**
	 * Annule l'enregistrement d'un type de signal précédemment
	 * enrregistré avec register()
	 * @param string sType type de signal
	 */
	unregister(sType) {
		this._oMediator.unregisterPluginSignal(sType, this);
	}

	/**
	 * Défini le médiateur
	 * @param Mediator.Mediator m
	 */
	setMediator(m) {
		this._oMediator = m;
	}
	
	getMediator() {
		return this._oMediator;
	}
	
	/**
	 * Raccourcis facilitant la communication inter plugin
	 */
	sendSignal() {
		return this._oMediator.sendSignal.apply(this._oMediator, Array.prototype.slice.call(arguments, 0));
	}
}

module.exports = Plugin;
