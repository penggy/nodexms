exports.index = function (req, res) {
	res.render('index', {
		title: '学校'
	})
}
exports.error = function (req, res) {
	throw new Error("custom error");
}

exports.user = require('./user');
exports.login = require('./login');













