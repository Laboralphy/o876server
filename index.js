var fs = require('fs');
var httpHelper = require('httphelper');
var wsHelper = require('wshelper');
var Emitter = require('events');
var CONFIG;


var oEmitter = new Emitter();

function readConfig() {
	var oConfig = {};
	var re = new RegExp('\(.+).js$', '');
	var aCfg = fs.readdirSync(__dirname + '/config/');
	var sFile;
	for (var i = 0; i < aCfg.length; ++i) {
		sFile = aCfg[i];
		aMatch = sFile.match(re);
		if (aMatch) {
			oConfig[aMatch[1]] = require(__dirname + '/config/' + sFile);
		}
	}
	return oConfig;
}




//////MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN //////
//////MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN //////
//////MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN ////// MAIN //////

function main() {
	console.log('O876 Modulable Server - dev version 2015-02-04');
	var sServerConfigKey = 'server';
	var c = readConfig();
	
	// configuration des services
	if (sServerConfigKey in c) {
		init(c[sServerConfigKey]);
	} else {
		throw new Error('Server configuration file not found : config/server.js');
	}

	var aServices = [];
	var oService;
	for (var s in c) {
		if (s != sServerConfigKey) {
			oService = require(s);
			if (!('service' in oService)) {
				throw new Error('Service ' + s + ' has no method "service()".');
			}
			if ('init' in oService) {
				oService.init(c[s]);
			}
			if ('emitter' in oService) {
				oService.emitter(oEmitter);
			}
			aServices.push(oService);
		}
	}
	run(aServices);
}

/**
 * lance tous les service
 * 1) le serveur HTTP
 * 2) les web sockets
 * 3) chaque service présents dans le config
 */
function run(aServices) {
	// http server init
	httpHelper.setDocumentRoot(CONFIG.root);
	httpHelper.run(CONFIG.port);
	
	// web socket init
	wsHelper.init(httpHelper.getServer());
	wsHelper.start();
	
	aServices.forEach(function(s) {
		// Services
		wsHelper.addService(s.service);
	});
	
	httpHelper.writeLog('server is listening on port ' + CONFIG.port + '...');
}

function init(c) {
	CONFIG = c;
}


main();
