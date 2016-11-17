"use strict"

var Mediator = require('mediator');

class LogPlugin extends Mediator.Plugin {
	
	init() {
		this.register('channelCreated');
		this.register('channelDestroyed');
		this.register('userConnected');
		this.register('userDisconnected');
		this.register('userJoined');
		this.register('userLeft');
		this.register('log');
		// this.register('message');
	}
	
	log() {
		var d = new Date();
		var s = Array.prototype.slice.call(arguments, 0).join(' ');
		console.log('[' + d.toJSON() + '] [T] ' + s);
	}
	
	userConnected(oUser) {
		this.log('user "' + oUser.sName + '" connected');
	}
	
	userDisconnected(oUser) {
		this.log('user "' + oUser.sName + '" disconnected');
	}
	
	channelCreated(oChannel) {
		this.log('channel "' + oChannel.sName + '" created');
	}
	
	channelDestroyed(oChannel) {
		this.log('channel "' + oChannel.sName + '" destroyed');
	}
	
	userJoined(oChannel, oUser) {
		this.log('user "' + oUser.sName + '" has joined channel "' + oChannel.sName  + '"');
	}
	
	userLeft(oChannel, oUser) {
		this.log('user "' + oUser.sName + '" has left channel "' + oChannel.sName + '"');
	}
	
	message(oMessageContext) {
		var sMessage = oMessageContext.message, 
			oChannel = oMessageContext.channel, 
			oUser = oMessageContext.user;
		var sChannelName = '';
		if (oChannel) {
			sChannelName = oChannel.sName;
		} else {
			sChannelName = '@' + oUser.sName;
		}
		this.log(oUser.sName + ' (' + sChannelName + '): ' + sMessage);
	}
	
}

module.exports = LogPlugin;
