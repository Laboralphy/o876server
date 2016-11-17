var aLOG = [];
var TxatSystem = require('../System.js');

module.exports.testbasic = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	test.ok(t, 'txat instanciated');
	var c = t.createChannel('bar');
	var u = t.createUser('foo', 1);
	test.ok(c, 'channel instanciated');
	test.ok(u, 'user instanciated');
	t.addUserToChannel(u.id, c.id);
	var aList = t.getChannelUserList(c.id);
	test.deepEqual(aList, [u.id], 'user list is ok');
	test.ok(u.oPowers[c.id], 'user has power for channel');
	test.equal(u.oPowers[c.id].nLevel, 2, 'user is admin');
	test.done();
};

module.exports.testchannellist = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	t.createChannel('ga');
	t.createChannel('bu');
	t.createChannel('zo');
	t.createChannel('meu');
	test.deepEqual(t.getChannels(), ['ga', 'bu', 'zo', 'meu'], 'list of channels');
	t.dropChannel(2);
	test.deepEqual(t.getChannels(), ['ga', 'zo', 'meu'], 'list of channels');
	test.done();
};

module.exports.testdiscuss = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	var aChat = [];
	t.emitter.on('message', function(s, c, us, ud) {
		aChat.push([us.id, c.id, ud.id, s.substr(0, 1)]);
	});
	var c1 = t.createChannel('barA');
	var c2 = t.createChannel('barB');
	var u1 = t.createUser('foo1a', 1);
	var u2 = t.createUser('foo2ab', 2);
	var u3 = t.createUser('foo3b', 3);
	t.addUserToChannel(u1.id, c1.id);
	t.addUserToChannel(u2.id, c1.id);
	t.addUserToChannel(u2.id, c2.id);
	t.addUserToChannel(u3.id, c2.id);
	
	var aList = t.getChannelUserList(c1.id);
	test.deepEqual(aList, [u1.id, u2.id], 'user list is ok for channel 1');
	aList = t.getChannelUserList(c2.id);
	test.deepEqual(aList, [u2.id, u3.id], 'user list is ok for channel 2');
	
	t.sendMessageToChannel(u1.id, c1.id, 'very interresting message');
	t.sendMessageToChannel(u3.id, c2.id, 'another very interresting message');
	t.dropUser(u2.id);
	t.addUserToChannel(u3.id, c1.id);
	t.sendMessageToChannel(u1.id, c1.id, 'wery interresting message');
	t.sendMessageToChannel(u3.id, c2.id, '4nother very interresting message');

	var aExp = [
	[1, 1, 1, 'v'], // user 1 sent a message to channel 1 (to user 1 & 2);
	[1, 1, 2, 'v'],
	
	[3, 2, 2, 'a'], // user 3 sent a message to channel 2 (to user 2 & 3);
	[3, 2, 3, 'a'],
	// user 2 left
	// user 3 joined channel 1
	[1, 1, 1, 'w'], // user 1 send to channel 1 (to user 1 & 3);
	[1, 1, 3, 'w'],
	
	[3, 2, 3, '4']  // user 3 send to channel 1 (to itself only);
	];
	
	test.deepEqual(aChat, aExp, 'txat activity');
	test.done();
};

module.exports.testchannelpermanence = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	var c = t.createChannel('bar');
	var u = t.createUser('foo', 1);
	t.addUserToChannel(u.id, c.id);
	test.ok(c.bPermanent, 'channel is permanent by default');
	test.equal(c.getUserCount(), 1, 'one user');
	test.deepEqual(t.getChannels(), ['bar'], 'one channel');
	t.removeUserFromChannel(u.id, c.id);
	test.equal(c.getUserCount(), 0, 'zero user but still online');
	c.bPermanent = false;
	t.addUserToChannel(u.id, c.id);
	test.equal(c.getUserCount(), 1, 'one user again');
	t.removeUserFromChannel(u.id, c.id);
	test.deepEqual(t.getChannels(), [], 'channel is gone');
	test.done();
};

module.exports.testchannel2 = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	var c = t.createChannel('bar');
	c.bPermanent = true;
	var u = t.createUser('foo', 1);
	t.addUserToChannel(u.id, c.id);
	var c2 = t.createChannel('bar2');
	c2.bPermanent = false;
	t.addUserToChannel(u.id, c2.id);
	t.removeUserFromChannel(u.id, c2.id);
	t.dropUser(u.id);
	test.equal(t.getChannels().join(' '), 'bar', 'one channel left');
	test.done();
};

module.exports.testautoadmin = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	var c = t.createChannel('bar');
	var u1 = t.createUser('foo1', 1);
	var u2 = t.createUser('foo2', 2);
	var u3 = t.createUser('foo3', 3);
	t.addUserToChannel(u1.id, c.id);
	t.addUserToChannel(u2.id, c.id);
	t.addUserToChannel(u3.id, c.id);
	test.equal(u1.oPowers[c.id].nLevel, 2, 'p1 u1 admin');
	test.equal(u2.oPowers[c.id].nLevel, 0, 'p1 u2 not admin');
	test.equal(u3.oPowers[c.id].nLevel, 0, 'p1 u3 not admin');
	t.dropUser(u1.id);
	test.equal(u2.oPowers[c.id].nLevel, 2, 'p2 u2 admin');
	test.equal(u3.oPowers[c.id].nLevel, 0, 'p2 u3 not admin');
	test.done();
};

module.exports.testautoadminwith2admins = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	var c = t.createChannel('bar');
	var u1 = t.createUser('foo1', 1);
	var u2 = t.createUser('foo2', 2);
	var u3 = t.createUser('foo3', 3);
	t.addUserToChannel(u1.id, c.id);
	t.addUserToChannel(u2.id, c.id);
	t.addUserToChannel(u3.id, c.id);
	u3.grantPowers(c.id, true);
	test.equal(u1.oPowers[c.id].nLevel, 2, 'u1 is automaticly admin');
	test.equal(u2.oPowers[c.id].nLevel, 0, 'u2 is not admin');
	test.equal(u3.oPowers[c.id].nLevel, 2, 'u3 has been promote admin');
	t.dropUser(u1.id);
	test.equal(u2.oPowers[c.id].nLevel, 0, 'admin u1 is gone but u2 is not admin (u3 is admin)');
	test.equal(u3.oPowers[c.id].nLevel, 2, 'admin u1 is gone and u3 remain the only admin');
	t.dropUser(u3.id);
	test.equal(u2.oPowers[c.id].nLevel, 2, 'no more admin left, u2 becomes admin');
	test.done();
};

module.exports.testblacklists = function(test) {
	var t = new TxatSystem();
	t.initPlugins([]);
	var c = t.createChannel('bar');
	var u1 = t.createUser('foo1', 1);
	var u2 = t.createUser('foo2', 2);
	var u3 = t.createUser('foo3', 3);
	t.addUserToChannel(u1.id, c.id);
	t.addUserToChannel(u2.id, c.id);
	t.addUserToChannel(u3.id, c.id);
	test.equal(u1.oPowers[c.id].nLevel, 2, 'u1 is admin by default, he can kick users !');
	// kick u3
	t.removeUserFromChannel(u3.id, c.id);
	test.ok(!(c.id in u3.oPowers), 'u3 has been kicked');
	c.addUserToBlackList(u3.sName);
	t.addUserToChannel(u3.id, c.id);
	test.ok(!(c.id in u3.oPowers), 'u3 should not be able to join channel');
	
	c.removeUserFromBlackList(u3.sName);
	t.addUserToChannel(u3.id, c.id);
	test.ok(c.id in u3.oPowers, 'u3 is bannished no more');
	test.done();
};
