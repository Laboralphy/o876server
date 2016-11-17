"use strict"

var Mediator = require('mediator');

class FilterPlugin extends Mediator.Plugin {
	
	constructor() {
		super();
		this.oWords = null;
		this.oFunctions = null;
	}
	
	init() {
		this.register('configFilter');
		this.register('message');
	}
	
	configFilter(oConfig) {
		this.setWords(oConfig.words);
	}
	
	setWords(a) {
		this.oWords = {};
		if (a) {
			for (var i in a) {
				this.oWords[i] = a[i];
			}
		}
	}
	
	processFilter(sMessage) {
		var sRep;
		var rx;
		var w, xWord, s, sWord;
		for (w in this.oWords) {
			rx = new RegExp(w, 'gi');
			if (sMessage.match(rx)) {
				sWord = this.oWords[w];
				if (typeof sWord == 'function') {
					sWord = sWord();
				}
				sMessage = sMessage.replace(rx, sWord);
			}
		}
		return sMessage;
	}
	
	message(ctx) {
		ctx.message = this.processFilter(ctx.message);
	}
}

module.exports = FilterPlugin;
