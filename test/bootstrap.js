module.exports = function(){
	//Load test Framework
	global.chai = require('chai');
	global.chai.use(require('chai-spies'));

	//cleanup require cache.. All modules should be loaded fresh on each test file script
	Object.keys(require.cache).forEach(function(sProperty){
		delete require.cache[sProperty];
	});
}
