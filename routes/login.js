var util = require('util');
var db = require('./db');
var page = require('./page');
var co = require('co');
var crypto = require('crypto');
var NodeCache = require("node-cache");
var errorCache = new NodeCache();

exports.login = function (req, res) {
	if (req.session.user) {
		res.redirect('/mp/');
		return;
	}
	res.render('login', {
		layout: false
	});
}
exports.logout = function (req, res) {
	req.session.destroy();
	res.redirect('/mp/login');
}
exports.doLogin = function (req, res) {
	var username = req.body.username;
    var password = req.body.password;
    var rememberMe = req.body.rememberMe;
	var errCnt = errorCache.get(username) || 0;
	if(errCnt >= 10){
		res.render('login', {
			errorMsg: '请稍后再试',
			username: username,
			rememberMe: rememberMe,
			layout: false
		});
		return;
	}
    var sql = "select * from user where name = ? and password = ?";
    db.query(sql, [username, password], function (err, rows, fields) {
        if (err) {
			res.render('login', {
				errorMsg: err.message,
				username: username,
				rememberMe: rememberMe,
				layout: false
            });
            return;
        }
        if (rows.length == 0) {
			errCnt++;
			errorCache.set(username, errCnt, 30);
            res.render('login', {
				errorMsg: util.format('用户名或密码不正确[%d/10]',errCnt),
				username: username,
				rememberMe: rememberMe,
				layout: false
            });
            return;
        }
		errorCache.del(username);
        req.session.user = rows[0].name;
        if ('yes' == rememberMe) {
			req.session.cookie.maxAge = 2 * 7 * 24 * 3600 * 1000;
        }
		var url = req.session.savedRequestUrl || "/mp/";
		delete req.session.savedRequestUrl;
        res.redirect(url);
    });
}
exports.doRegist = function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var phonenumber = req.body.phonenumber;
	var sql = "select * from user where name = ?";
	db.query(sql, [username], function (err, rows, fields) {
		if (err) {
			res.status(500).send(err.message);
			return;
		}
		if (rows.length > 0) {
			res.status(500).send("用户名已存在");
			return;
		}
		sql = "select * from user where phonenumber = ?"
		db.query(sql, [phonenumber], function (err, rows, fields) {
			if (err) {
				res.status(500).send(err.message);
				return;
			}
			if (rows.length > 0) {
				res.status(500).send("手机号已存在");
				return;
			}
			sql = "insert into user (name,password,phonenumber) values (?,?,?)";
			db.query(sql, [username, password, phonenumber], function (err, result) {
				if (err) {
					res.status(500).send(err.message);
					return;
				}
				res.end();
			});
		});
	});
}
exports.modifypwd = function (req, res) {
	var oldPwd = req.body.oldPwd;
	var newPwd = req.body.newPwd;
	var newPwd2 = req.body.newPwd2;
	var username = req.session.user;
	if (!username) {
		res.redirect("/mp/login");
		return;
	}
	var sql = "select * from user where name = ? and password = ?";
	db.query(sql, [username, oldPwd], function (err, rows, fields) {
		if (err) {
			res.status(500).send(err.message);
			return;
		}
		if (rows.length == 0) {
			res.status(500).send("原密码不正确");
			return;
		}
		sql = "update user set password = ? where name = ?";
		db.query(sql, [newPwd, username], function (err, result) {
			if (err) {
				res.status(500).send(err.message);
				return;
			}
			res.end();
		});
	});
}













