var User = require('../User.js');

module.exports.testbasic = function(test) {
	var u = new User();
	u.grantPowers(10);
	u.grantPowers(13);
	u.grantPowers(16);
	var a = u.getChannelList();
	test.deepEqual(a, [10, 13, 16], 'added 3 channels');
	test.done();
};

