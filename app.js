var env = process.env.NODE_ENV || 'development';
global.db = require("./db");
global.page = function (req, res, sql, params) {
	var page = parseInt(req.body.page);
	var limit = parseInt(req.body.rows);
	if (isNaN(page) || isNaN(limit)) {
		res.status(500).send("分页数据缺失");
		return;
	}
	var start = limit * (page - 1);
	var _sql = sql.replace(/\s*(o|O)(r|R)(d|D)(e|E)(r|R)\s+(b|B)(y|Y).*$/, "");
	cntSql = "select count(*) from (" + _sql + ") as count";
	var ret = {};
	var db = new Database;
	try {
		db.serialize(function () {
			db.get(cntSql, params, function (err, row) {
				if (err) throw err;
				ret.total = row["count"];
			});
			if (req.body.sort) {
				_sql += " order by " + req.body.sort + " " + req.body.order;
			}
			_sql += " limit ?,?";
			params.push(start, limit);
			db.all(_sql, params, function (err, rows) {
				if (err) throw err;
				ret.rows = rows;
			})
			res.json(ret);
		})
	} catch (e) {
		res.status(500).send(err.message);
	} finally {
		db.close();
	}
}
global.onError = function (err, req, res) {
	var fs = require('fs');
	var errorLogfile = fs.createWriteStream('error.log', { flags: 'a' });
	errorLogfile.write('[' + new Date() + '] ' + req.url + '\n');
	errorLogfile.write(err.stack + '\n');
	if (req.xhr) {
		res.status(500).send(err.message);
	} else {
		res.render('error', { title: "出错了", message: err.message });
	}
}

var express = require('express');
var bodyParser = require('body-parser')
var routes = require(__dirname + '/routes');
var partials = require('express-partials');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var SQLiteStore = require('connect-sqlite3')(session);

var app = express();
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'html');

app.locals.scripts = [];
app.locals.addScripts = function (all) {
	app.locals.scripts = [];
	if (all != undefined) {
		return all.map(function (script) {
			return "<script src='" + script + "'></script>";
		}).join('\n ');
	}
	else {
		return '';
	}
};
app.locals.getScripts = function (req, res) {
	return scripts;
};
app.locals.styles = [];
app.locals.addStyles = function (all) {
	app.locals.styles = [];
	if (all != undefined) {
		return all.map(function (style) {
			return "<link rel='stylesheet' href='" + style + "'>";
		}).join('\n ');
	}
	else {
		return '';
	}
};
app.locals.getStyles = function (req, res) {
	return styles;
};
app.locals.title = "xms";

app.use(partials());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

app.use(session({
	secret: 'penggy',
	store: new SQLiteStore,
	resave: true,
	saveUninitialized: true
}));

app.use(function (req, res, next) {
	res.locals.query = req.query;
	// var openPaths = ['/login', '/regist', '/error'];
	// var needLogin = true;
	// for (var i = 0; i < openPaths.length; i++) {
	// 	var openPath = openPaths[i];
	// 	if (req.path == openPath) {
	// 		needLogin = false;
	// 		break;
	// 	}
	// }
	// if (needLogin && !req.session.user) {
	// 	req.session.savedRequestUrl = req.originalUrl;
	// 	res.redirect("/login");
	// 	return;
	// }
	// res.locals.user = req.session.user;
	return next();
});

app.get('/', routes.index);
app.use('/error', routes.error);

app.get('/login', routes.login.login);
app.get('/logout', routes.login.logout);
app.post('/login', routes.login.doLogin);
app.post('/regist', routes.login.doRegist);
app.post('/modifypwd', routes.login.modifypwd);

app.get('/user', routes.user.user);
app.post('/user/users', routes.user.users);
app.post('/user/resetpwd', routes.user.resetpwd);
app.post('/user/save', routes.user.save);
app.post('/user/remove', routes.user.remove);

app.use(function (err, req, res, next) {
	onError(err,req,res);
});

if (!module.parent) {
	var server = app.listen(3000);
	console.log("Express server listening on port %d in %s mode", server.address().port, env);
}

module.exports = app;