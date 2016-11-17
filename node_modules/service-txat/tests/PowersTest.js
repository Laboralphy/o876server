var Powers = require('../Powers.js');

module.exports.testlevels = function(test) {
	var p = new Powers();
	test.ok(!!p, 'powers instantiated');
	test.equal(p.nLevel, 0, 'user level 0');
	p.preset(2);
	test.equal(p.nLevel, 2, 'user level 0');
	test.ok(p.bSend, 'can send');
	test.ok(p.bReceive, 'can receive');
	test.ok(p.bInvite, 'can invite');
	test.ok(p.bKick, 'can kick');
	test.ok(p.bBan, 'can ban');
	test.ok(p.bUnban, 'can unban');
	test.ok(p.bPromote, 'can promote');
	test.ok(p.bDemote, 'can demote');
	

	p.preset(1);
	test.equal(p.nLevel, 1, 'user level 1');
	test.ok(p.bSend, 'can send');
	test.ok(p.bReceive, 'can receive');
	test.ok(p.bInvite, 'can invite');
	test.ok(p.bKick, 'can kick');
	test.ok(p.bBan, 'can ban');
	test.ok(p.bUnban, 'can unban');
	
	test.ok(!p.bPromote, 'cannot promote');
	test.ok(!p.bDemote, 'cannot demote');

	p.preset(0);
	test.equal(p.nLevel, 0, 'user level 1');
	test.ok(p.bSend, 'can send');
	test.ok(p.bReceive, 'can receive');
	
	test.ok(!p.bInvite, 'cannot invite');
	test.ok(!p.bKick, 'cannot kick');
	test.ok(!p.bBan, 'cannot ban');
	test.ok(!p.bUnban, 'cannot unban');
	test.ok(!p.bPromote, 'cannot promote');
	test.ok(!p.bDemote, 'cannot demote');
	
	p.preset(2);
	
	var p2 = new Powers();
	p2.preset(0);

	var p3 = new Powers();
	p3.preset(0);
	
	test.equal(p2.nLevel, 0, 'user2 level 0');
	test.equal(p3.nLevel, 0, 'user3 level 0 too');
	
	p2.promote(p3);
	test.equal(p3.nLevel, 0, 'user2 cannot promote user3');

	p.promote(p3);
	test.equal(p3.nLevel, 1, 'user1 can promote user3');
	test.done();
	
};
