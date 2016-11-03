var util = require('util');
var co = require('co');
var crypto = require('crypto');
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
	var errCnt = errorCache.get(username) || 0;
	if (errCnt >= 10) {
		res.render('login', {
			errorMsg: '请稍后再试',
			username: username,
			rememberMe: rememberMe,
			layout: false
		});
		return;
	}
	var db = new Database;
	var sql = "select * from t_user where name = ? and password = ?";
	try {
		db.serialize(function () {
			db.get(sql, [username, password], function (err, row) {
				if (err) throw err;
				if (!row) {
					errCnt++;
					errorCache.set(username, errCnt, 30);
					throw new Error(util.format('用户名或密码不正确[%d/10]', errCnt));
				}
			})
		})
		errorCache.del(username);
		req.session.user = username;
		if ('yes' == rememberMe) {
			req.session.cookie.maxAge = 2 * 7 * 24 * 3600 * 1000;
		}
		var url = req.session.savedRequestUrl || "/";
		delete req.session.savedRequestUrl;
		res.redirect(url);
	} catch (e) {
		res.render('login', {
			errorMsg: e.message,
			username: username,
			rememberMe: rememberMe,
			layout: false
		});
	} finally {
		db.close();
	}
}
exports.doRegist = function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var db = new Database;
	var sql = "select * from t_user where name = ?";
	try{
		db.serialize(function(){
			db.get(sql,[username],function(err,row){
				if(err) throw err;
				if(row) throw new Error("用户名已存在");
			})
			sql = "insert into t_user(id,name,password,regist_time) values(?,?,?,?)";
			var uuid = require("node-uuid");
			var id = uuid.v4().replace(/\-/g,"");
			var moment = require("moment");
			var time = moment().format('yyyy-MM-dd HH:mm:ss');
			db.run(sql,[id,username,password,time],function(err){
				if(err) throw err;
			})
			res.end();
		})
	}catch(e){
		res.status(500).send(e.message);
	}finally{
		db.close();
	}
}
exports.modifypwd = function (req, res) {
	var oldPwd = req.body.oldPwd;
	var newPwd = req.body.newPwd;
	var username = req.session.user;
	if (!username) {
		res.redirect("/login");
		return;
	}
	var db = new Database;
	var sql = "select * from t_user where name = ? and password = ?";
	try{
		db.serialize(function(){
			db.get(sql,[username,oldPwd],function(err,row){
				if(err) throw err;
				if(!row) throw new Error("原密码不正确");
			})
			sql = "update t_user set password = ? where name = ?";
			db.run(sql,[newPwd,username],function(err){
				if(err) throw err;
			})
			res.end();
		})
	}catch(e){
		res.status(500).send(e.message);
	}finally{
		db.close();
	}
}













