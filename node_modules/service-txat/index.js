var wsh = require('wshelper');
var http = require('httphelper');
var TxatSystem = require('./System.js');


var CONST = require('./consts.js');
var util = require('util');

var oTxat;


function registerClient(sUserName, id) {
	try {
		oTxat.checkUserLoginName(sUserName);
		var u = oTxat.createUser(sUserName, id);
		oTxat.userJoinsChannel(u.id, oTxat.getChannel(1).sName);
	} catch (e) {
		console.log(e.stack);
	}

}

////// TXAT SYSTEM ////// TXAT SYSTEM ////// TXAT SYSTEM ////// TXAT SYSTEM //////
////// TXAT SYSTEM ////// TXAT SYSTEM ////// TXAT SYSTEM ////// TXAT SYSTEM //////
////// TXAT SYSTEM ////// TXAT SYSTEM ////// TXAT SYSTEM ////// TXAT SYSTEM //////

function txatInit(c) {
	oTxat = new TxatSystem();
	oTxat.emitter.on('message', txatMessage);
	oTxat.emitter.on('notify', txatNotify);
	oTxat.configure(c);
	http.writeLog('txat system online');
}

/**
 * Function appelée en callback lorsqu'un client se connecte
 * @param Socket oSocket
 */

function txatService(oSocket) {
		
	oSocket.on('disconnect', function() {
		try {
			if (wsh.checkSession(oSocket)) {
				// signaler la déconnexion aux autres
				var nId = wsh.getSocketId(oSocket);
				if (!!nId) {
					oTxat.dropUser(nId);
				} else {
					http.writeLog('this client had no ID');
				}
			}
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});
	
	////// MESSAGES TXAT ////// MESSAGES TXAT ////// MESSAGES TXAT ////// MESSAGES TXAT //////
	////// MESSAGES TXAT ////// MESSAGES TXAT ////// MESSAGES TXAT ////// MESSAGES TXAT //////
	////// MESSAGES TXAT ////// MESSAGES TXAT ////// MESSAGES TXAT ////// MESSAGES TXAT //////
	
	/** 
	 * message de discussion public
	 * T_SAY
	 * - m: string, contenu du message.
	 * - c: string, référence du canal sur lequel envoyer le message
	 */
	oSocket.on(CONST.OPCODE.C_SAY, function(xData) {
		try {
			if (xData.m !== '') {
				var nId = wsh.getSocketId(oSocket);
				oTxat.sendMessageToChannel(nId, oTxat.getChannelId(xData.c), xData.m);
			}
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});
	
	/**
	 * message privé à destination d'un utilisateur
	 * T_MSG
	 * - m: string, contenu du message
	 * - u: nom de l'utilisateur destinataire
	 */
	oSocket.on(CONST.OPCODE.C_MSG, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			oTxat.sendMessageToUser(nId, oTxat.getUserId(xData.u), xData.m);
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});

	/**
	 * rejoindre un canal
	 * T_JOIN
	 * - c: string, nom du canal à rejoindre
	 */
	oSocket.on(CONST.OPCODE.C_JOIN, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			oTxat.userJoinsChannel(nId, xData.c);
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});

	/**
	 * quitter un canal
	 * T_LEAVE
	 * - c: nom du canal à quitter
	 */
	oSocket.on(CONST.OPCODE.C_LEAVE, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			oTxat.removeUserFromChannel(nId, oTxat.getChannelId(xData.c));
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});
	
	/**
	 * Demander la liste des canaux qui ont été créé sur le serveur
	 * et auxquels l'utilisateur à le droit de se connecter
	 * T_LIST
	 * 
	 */
	oSocket.on(CONST.OPCODE.C_LIST, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			var aList = oTxat.getUserAccessibleChannels(nId);
			oSocket.emit(CONST.OPCODE.LS, {c: aList});
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});
	
	/**
	 * Demander des informations sur un utilisateur.
	 * Les information sont relative à un canal données
	 * Ce qui fait que cette commande permet de découvrir le profil 
	 * utilisateur dans le contexte du canal spécifié.
	 * 
	 * T_WHO
	 * - u: string, nom de l'utilisateur
	 * - c: string, canal de discussion pour déterminer les droits de cet utilisateur dans ce canal.
	 */
	oSocket.on(CONST.OPCODE.C_WHO, function(xData) {
		try {
			var sWho = xData.u;
			var sChannel = xData.c;
			var idChannel = oTxat.getChannelId(sChannel);
			var oUser = oTxat.getUser(oTxat.getUserId(sWho));
			var oChannel = oTxat.getChannel(idChannel);
			if (idChannel.toString() in oUser.oPowers) {
				var p = oUser.oPowers[idChannel.toString()];
				var sInfo = util.format(CONST.MESSAGE.USER_ON_CHANNEL, sWho, p.getRankStr(), sChannel);
				oSocket.emit(CONST.OPCODE.IM, {c: sChannel, m: sInfo});
			} else {
				txatErrorMessage(oSocket, util.format(CONST.MESSAGE.USER_NOT_ON_CHANNEL, sWho, sChannel));
			}
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});
	
	/**
	 * Bannir un utilisateur d'un canal
	 * - u: string, nom de l'utilisateur
	 * - c: string, canal concerné
	 * - m: string: texte libre, raison du bannissement
	 * - t: int: durée du bannissement (en minutes)
	 */
	oSocket.on(CONST.OPCODE.C_BAN, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			var sChannel = xData.c;
			if ('u' in xData) {
				// ban user
				var sUser = xData.u;
				var nTime = xData.t | 0;
				var sWhy = xData.m;
				oTxat.banUserFromChannel(oTxat.getUserId(sUser), oTxat.getChannelId(sChannel), nTime, sWhy, nId);
			} else {
				// ban reports
				var oChannel = oTxat.getChannel(oTxat.getChannelId(sChannel));
				var oReport = oChannel.getBanReports(' - ');
				var aTo = [oSocket];
				var r, sReport;
				for (var sUser in oReport) {
					wsh.send(aTo, CONST.OPCODE.IM, {c: sChannel, m: sUser + oReport[sUser]});
				}
			}
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});

	/**
	 * Annuler le bannissement d'un utilisateur d'un canal spécifié
	 * - u: string, nom de l'utilisateur
	 * - c: string, canal concerné
	 */
	oSocket.on(CONST.OPCODE.C_UNBAN, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			var sUser = xData.u;
			var sChannel = xData.c;
			oTxat.unbanUserFromChannel(oTxat.getUserId(sUser), oTxat.getChannelId(sChannel), nId);
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});

	/**
	 * Augmente le niveau d'un utilisateur. Cela ne concerne qu'un seul canal.
	 * Plus l'utilisateur a de niveau, plus il a accès à des commande d'admin.
	 * - u: string, nom de l'utilisateur
	 * - c: string, canal concerné
	 */
	oSocket.on(CONST.OPCODE.C_PROMOTE, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			var sUser = xData.u;
			var sChannel = xData.c;
			var p = oTxat.promoteUser(oTxat.getChannelId(sChannel), oTxat.getUserId(sUser), nId);
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});

	/**
	 * Diminue le niveau d'un utilisateur. Cela ne concerne qu'un seul canal.
	 * - u: string, nom de l'utilisateur
	 * - c: string, canal concerné
	 */
	oSocket.on(CONST.OPCODE.C_DEMOTE, function(xData) {
		try {
			var nId = wsh.getSocketId(oSocket);
			var sUser = xData.u;
			var sChannel = xData.c;
			var p = oTxat.demoteUser(oTxat.getChannelId(sChannel), oTxat.getUserId(sUser), nId);
		} catch (e) {
			txatErrorMessage(oSocket, e);
		}
	});
}



function txatErrorMessage(oSocket, e) {
	oSocket.emit(CONST.OPCODE.ER, {e: e.toString()});
}

function txatGetChannelUserSockets(oChannel) {
	return oChannel.getUserList().map(function(i, n, a) {
		return wsh.getSocket(i);
	});
}


function txatMessage(sMessage, oFromChannel, oFromUser, oToUser, oExtraData) {
	if (oFromChannel) {
		wsh.getSocket(oToUser.id).emit(CONST.OPCODE.CM, {u: oFromUser.getName(), c: oFromChannel.sName, m: sMessage, d: oExtraData});
	} else {
		wsh.getSocket(oToUser.id).emit(CONST.OPCODE.UM, {u: oFromUser.getName(), m: sMessage, d: oExtraData});
	}
}

function txatNotify(sMessage) {
	var oUser, oChannel;
	switch (sMessage) {
		case 'userJoined':
			oChannel = arguments[1];
			oUser = arguments[2];
			wsh.send(txatGetChannelUserSockets(oChannel), CONST.OPCODE.CA, {u: oUser.sName, c: oChannel.sName});
		break;

		case 'userLeft':
			oChannel = arguments[1];
			oUser = arguments[2];
			wsh.send(txatGetChannelUserSockets(oChannel), CONST.OPCODE.CD, {u: oUser.sName, c: oChannel.sName});
		break;
		
		case 'userList':
			oUser = arguments[1];
			oChannel = arguments[2];
			var aUserList = arguments[3];
			wsh.send([wsh.getSocket(oUser.id)], CONST.OPCODE.CL, {c: oChannel.sName, u: aUserList});
		break;
		
		case 'newAdmin':
			oChannel = arguments[1];
			oUser = arguments[2];
			wsh.send(txatGetChannelUserSockets(oChannel), CONST.OPCODE.IM, {c: oChannel.sName, m: util.format(CONST.MESSAGE.NEW_ADMIN, oUser.sName)});
		break;
		
		case 'userAccessDenied':
			oChannel = arguments[1];
			oUser = arguments[2];
			var sReport = oChannel.getBanReport(oUser.sName, '<br />');
			txatErrorMessage(wsh.getSocket(oUser.id), CONST.MESSAGE.ACCESS_DENIED + ' ' + sReport);
		break;

		case 'userBanned':
			oChannel = arguments[1];
			oUser = arguments[2];
			var nTime = arguments[3];
			var sWhy = arguments[4];
			var oJudge = arguments[5];
			var sBannishmentMessage = util.format(CONST.MESSAGE.USER_BANNED, oUser.sName) + oChannel.getBanReport(oUser.sName, ' - ');
			wsh.send(txatGetChannelUserSockets(oChannel), CONST.OPCODE.IM, {c: oChannel.sName, m: sBannishmentMessage});
			txatErrorMessage(wsh.getSocket(oUser.id), util.format(CONST.MESSAGE.BANNED, oChannel.sName) + oChannel.getBanReport(oUser.sName, '<br />'));
			wsh.send(wsh.getSocket(oUser.id), CONST.OPCODE.IM, {c: oChannel.sName, m: sBannishmentMessage});
		break;
		
		case 'userPromote':
		case 'userDemote':
			oChannel = arguments[1];
			oUser = arguments[2];
			wsh.send(txatGetChannelUserSockets(oChannel), CONST.OPCODE.IM, {c: oChannel.sName, m: util.format(CONST.MESSAGE.IS_NOW, oUser.sName, oUser.oPowers[oChannel.id].getRankStr())});
		break;		
	}
}

function setEmitter(e) {
	e.on('auth', function(oAuth) {
		registerClient(oAuth.name, oAuth.id);
	});
}

module.exports = {
	service: txatService,
	init: txatInit,
	emitter: setEmitter
};
