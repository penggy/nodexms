/**
 * Created by wupeng on 16/10/5.
 */
// var db = new Database();
var crypto = require('crypto');

exports.users = function (req, res) {
    var sql = "select * from user where 1=1";
    var params = [];
    if (req.body.queryText) {
        sql += " and (phonenumber like ? or name like ?)"
        params.push("%" + req.body.queryText + "%", "%" + req.body.queryText + "%");
    }
    sql += " order by name desc";
    page(req, res, sql, params);
}

exports.user = function (req, res) {
    res.render('user', {
        title: '用户管理'
    })
}
exports.resetpwd = function (req, res) {
    var username = req.body.name;
    var index = parseInt(req.body.index);
    var md5sum = crypto.createHash('md5');
    md5sum.update("1234");
    var _password = md5sum.digest('hex');
    var sql = "update user set password = ? where `index` = ?";
    db.query(sql, [_password, index], function (err, result) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.end();
    });
}

exports.resetpwd = function (req, res) {
    var username = req.body.name;
    var index = parseInt(req.body.index);
    var md5sum = crypto.createHash('md5');
    md5sum.update("1234");
    var _password = md5sum.digest('hex');
    var sql = "update user set password = ? where `index` = ?";
    db.query(sql, [_password, index], function (err, result) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.end();
    });
}

exports.save = function (req, res) {
    var index = parseInt(req.body.index);
    var name = req.body.name;
    var phonenumber = req.body.phonenumber;
    var sql = "select * from user where (name = ? or phonenumber = ?)";
    var params = [name, phonenumber];
    if (index > 0) {
        sql += " and `index` != ?";
        params.push(index);
    }
    db.query(sql, params, function (err, rows, fields) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (rows.length > 0) {
            res.status(500).send("用户名或手机号已存在");
            return;
        }
        if (index > 0) {
            sql = "update user set name = ?, phonenumber = ? where `index` = ?";
            params = [name, phonenumber, index];
        } else {
            var md5sum = crypto.createHash('md5');
            md5sum.update('1234');
            var _password = md5sum.digest('hex');
            params = [name, phonenumber, _password];
            sql = "insert into user(name,phonenumber,password) values(?,?,?)"
        }
        db.query(sql, params, function (err, result) {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.end();
        });
    })
}

exports.remove = function (req, res) {
    var index = parseInt(req.body.index);
    var sql = "delete from user where `index` = ?";
    db.query(sql, [index], function (err, result) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.end();
    });
}