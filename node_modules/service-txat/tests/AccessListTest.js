var AccessList = require('../AccessList.js');

module.exports.testBasic = function(test) {
	var l = new AccessList();
	test.ok(l, 'Access List ok');
	test.deepEqual(l.oList, {}, 'list is ready');
	test.done();
};

module.exports.testManageUsers = function(test) {
	var l = new AccessList();
	l.addUser('foo');
	l.addUser('bar', 1000);
	test.deepEqual(l.oList, {foo:0, bar:1000}, 'two user added');
	l.removeUser('foo');
	test.deepEqual(l.oList, {bar:1000}, 'foo removed');
	l.removeUser('toto');
	test.deepEqual(l.oList, {bar:1000}, 'try to remove toto but no one found : no error though');
	l.removeUser('bar');
	test.deepEqual(l.oList, {}, 'bar removed : list is empty');
	test.done();
};

module.exports.testUserListed = function(test) {
	var l = new AccessList();
	var t = Date.now() + 24 * 3600 * 1000;
	l.addUser('alwaysWelcome');
	l.addUser('tooOld', 1000);
	l.addUser('still3days', t);
	test.ok(l.isUserListed('alwaysWelcome'), 'always welcome');
	test.ok(!l.isUserListed('tooOld'), 'too old');
	test.ok(l.isUserListed('still3days'), 'still 3 days');
	test.done();
};
