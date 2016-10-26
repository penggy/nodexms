exports.index = function (req, res) {
	res.render('index', {
		title: '学校'
	})
}
exports.error = function (req, res) {
	throw new Error("custom error");
}

exports.user = require('./user');
exports.log = require('./log');
exports.login = require('./login');
exports.school = require('./school');
exports.cookbook = require('./cookbook');
exports.food = require('./food');













