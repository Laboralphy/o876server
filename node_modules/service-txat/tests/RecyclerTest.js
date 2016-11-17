var Recycler = require('../Recycler.js');

module.exports.testbasic = function(test) {
	var r = new Recycler();
	test.ok(!!r, 'objet instanciable');
	test.equal(r.aIds.length, 0, 'aIds is array and is 0 lengthed');
	test.equal(r.nLastId, 0, 'last id is 0 at init');
	test.done();
};

module.exports.testidget = function(test) {
	var r = new Recycler();
	var id = r.getId();
	test.equal(id, 1, 'first id should be 1');
	test.done();
};
 
module.exports.testinstancereset = function(test) {
	var r = new Recycler();
	var id = r.getId();
	test.equal(id, 1, 'first id should be 1');
	id = r.getId();
	test.equal(id, 2, 'next id should be 2');
	r.reset();
	test.equal(r.aIds.length, 0, 'aIds is now 0 lengthed');
	test.equal(r.nLastId, 0, 'last id is 0 at reset');
	test.done();
};

module.exports.testdispose = function(test) {
	var r = new Recycler();
	var id;
	id = r.getId();
	id = r.getId();
	id = r.getId();
	test.equal(id, 3, 'this id shouyld be 3');
	r.disposeId(2);
	test.deepEqual(r.aIds, [2], 'list inspection, should contain only 2');
	test.equal(r.nLastId, 3, 'still 3 after dispose');
	id = r.getId();
	test.equal(id, 2, 'from the dispose array');
	id = r.getId();
	test.equal(id, 4, 'dispose array was empty, new id');
	test.deepEqual(r.aIds, [], 'list inspection should be empty');
	id = r.getId();
	id = r.getId();
	id = r.getId();
	test.equal(id, 7, 'should be 7');
	
	r.disposeId(1);
	r.disposeId(4);
	r.disposeId(3);
	test.deepEqual(r.aIds, [1, 4, 3], 'list inspection should be this array 1,4,3');
	test.equal(r.getId(), 1, 'in order (older to most recently disposed 1');
	test.equal(r.getId(), 4, 'in order (older to most recently disposed 4');
	test.equal(r.getId(), 3, 'in order (older to most recently disposed 3');
	test.deepEqual(r.aIds, [], 'no more id');
	test.done();
};
