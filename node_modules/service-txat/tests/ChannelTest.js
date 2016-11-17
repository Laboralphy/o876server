var Channel = require('../Channel.js');
var user = require('../User.js');

module.exports.testbasic = function(test) {
	var c = new Channel();
	test.ok(!!c, 'channel instantiated');
	test.deepEqual(c.aUsers, [], 'users is an empty array');
	test.ok(!!c.oWhiteList, 'whitelist is an empty object');
	test.ok(!!c.oBlackList, 'blacklist is an empty object');
	test.equal(c.getUserCount(), 0, 'no user in empty channel');
	test.done();
};

module.exports.testwhitelist = function(test) {
	var c = new Channel();
	var nDelay = 3 * 24 * 3600 * 1000;
	var nNow = Date.now();
	test.ok(c.isPublic(), 'channel has no white list yet');
	test.ok(c.isUserAccessGranted('foo'), 'foo is allowed to public channel');
	test.ok(c.isUserAccessGranted('bar'), 'bar is allowed to public channel');
	c.addUserToWhiteList('foo', nNow + nDelay);
	test.deepEqual(c.oWhiteList.oList, {foo: nNow + nDelay}, 'user foo registred in white list');
	test.ok(!c.isPublic(), 'channel has no white list yet');
	test.ok(c.isUserAccessGranted('foo'), 'foo is allowed to private channel');
	test.ok(!c.isUserAccessGranted('bar'), 'bar is no more allowed to private channel');
	test.done();
};

var User = function() {};
User.prototype.id = 0;
User.prototype.sName = '';
User.prototype.getName = function() {
		return this.sName;
};
User.prototype.grantPowers = function() {};
User.prototype.stripPowers = function() {};


function createUser(id, name) {
	var u = new User();
	u.id = id;
	u.sName = name;
	return u;
}

module.exports.testaddinguser = function(test) {
	var c = new Channel();
	var u = createUser(10, 'foo');
	test.ok(u, 'user instanciated');
	test.equal(u.sName, 'foo', 'user mock checking name');
	test.equal(u.id, 10, 'user mock checking name');
	c.addUser(u);
	
	test.equal(c.getUserCount(), 1, 'one user');
	var u1 = createUser(11, 'bar');
	c.addUser(u1);
	test.equal(c.getUserCount(), 2, 'two users');
	test.equal(c.aUsers[0], 10, 'user 0 is foo');
	test.equal(c.aUsers[1], 11, 'user 1 is foo');
	c.removeUser(u);
	test.equal(c.aUsers[0], 11, 'user 0 is bar now');
	test.equal(c.getUserCount(), 1, 'one user');
	c.removeUser(u1);
	test.equal(c.getUserCount(), 0, 'no more user');
	c.addUser(u);
	var bException = false;
	try {
		c.addUser(u);
	} catch (e) {
		bException = true;
	}
	test.ok(bException, 'error has occured when adding the same user twice');
	test.done();
};
