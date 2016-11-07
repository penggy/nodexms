var NodeCache = require("node-cache");
var errorCache = new NodeCache();

exports.login = function (req, res) {
	if (req.session.user) {
		res.redirect('/');
		return;
	}
	res.render('login', {
		layout: false
	});
}
exports.logout = function (req, res) {
	req.session.destroy();
	res.redirect('/login');
}
exports.doLogin = function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var rememberMe = req.body.rememberMe;
	co(function* () {
		var errCnt = errorCache.get(username) || 0;
		if (errCnt >= 10) throw new Error("请稍后再试!");
		var sql = "select * from t_user where name = ? and password = ?";
		var row = yield db.get(sql, [username, password]);
		if (!row) {
			errCnt++;
			errorCache.set(username, errCnt, 30);
			throw new Error(util.format("用户名或密码不正确[%d/10]", errCnt));
		}
		errorCache.del(username);
		req.session.user = username;
		if ('yes' == rememberMe) {
			req.session.cookie.maxAge = 2 * 7 * 24 * 3600 * 1000;
		}
		var url = req.session.savedRequestUrl || "/";
		delete req.session.savedRequestUrl;
		res.redirect(url);
	}).catch(function (e) {
		res.render('login', {
			errorMsg: e.message,
			username: username,
			rememberMe: rememberMe,
			layout: false
		});
	});
}
exports.doRegist = function (req, res) {
	co(function* () {
		var username = req.body.username;
		var password = req.body.password;
		var sql = "select * from t_user where name = ?";
		var row = yield db.get(sql, [username]);
		if (row) throw new Error("用户名已存在");
		sql = "insert into t_user(id,name,password,regist_time) values(?,?,?,?)";
		yield db.run(sql, [uuid(), username, password, formatDateTime()]);
		res.end();
	}).catch(function (err) {
		res.status(500).send(err.message);
	})
}
exports.modifypwd = function (req, res) {
	var oldPwd = req.body.oldPwd;
	var newPwd = req.body.newPwd;
	var username = req.session.user;
	if (!username) {
		res.redirect("/login");
		return;
	}
	co(function* () {
		var sql = "select * from t_user where name = ? and password = ?";
		var row = yield db.get(sql, [username, oldPwd]);
		if (!row) throw new Error("原密码不正确");
		sql = "update t_user set password = ? where name = ?";
		yield db.run(sql, [newPwd, username]);
		res.end();
	}).catch(function (err) {
		res.status(500).send(err.message);
	})
}













