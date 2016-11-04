exports.index = function (req, res) {
	res.render('user')
}
exports.error = function (req, res) {
	throw new Error("custom error");
}

exports.user = require('./user');
exports.login = require('./login');
exports.menu = require('./menu');













