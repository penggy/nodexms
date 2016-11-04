global.uuid = function () { return require('node-uuid').v4().replace(/\-/g, ''); }
global.md5 = function (str) { return require('crypto').createHash('md5').update(str).digest('hex'); }
global.formatDateTime = function (d) { return require('moment')(d).format('YYYY-MM-DD HH:mm:ss'); }
global.formatDate = function (d) { return require('moment')(d).format('YYYY-MM-DD'); }
global.db = require("./db");
db.init();
var env = process.env.NODE_ENV || 'development';
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
app.locals.title = "NodeXms";
app.locals.miniTitle = "XMS";

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

app.use('/menu',routes.menu);

app.use(function (err, req, res, next) {
	var fs = require('fs');
	var errorLogfile = fs.createWriteStream('error.log', { flags: 'a' });
	errorLogfile.write('[' + new Date() + '] ' + req.url + '\n');
	errorLogfile.write(err.stack + '\n');
	if (req.xhr) {
		res.status(500).send(err.message);
	} else {
		res.render('error', { title: "出错了", message: err.message });
	}
});

if (!module.parent) {
	var server = app.listen(3000);
	console.log("Express server listening on port %d in %s mode", server.address().port, env);
}

module.exports = app;