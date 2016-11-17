var FilterPlugin = require('../../txat-plugins/FilterPlugin.js');

module.exports.testbasic = function(test) {
	var f = new FilterPlugin();
	f.setWords({gayzor:'######'});
	test.ok(f, 'Filter plugin ok');
	test.equal(f.processFilter('xxxx'), 'xxxx', 'no filter');
	test.equal(f.processFilter('xxxx gAyZoR'), 'xxxx ######', 'filtered');
	test.done();
};

