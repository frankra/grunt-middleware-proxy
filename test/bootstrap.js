module.exports = function(){
	//Load test Framework
	global.chai = require('chai');
	global.chai.use(require('chai-spies'));
}
