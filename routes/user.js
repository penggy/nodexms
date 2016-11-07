var co = require('co');
var express = require('express');
var user = express.Router();

user.get('/',function (req, res) {
    res.render('user');
})

user.post('/users',function (req, res) {
    var sql = "select * from t_user where 1=1";
    var params = [];
    if (req.body.queryText) {
        sql += " and name like ?"
        params.push("%" + req.body.queryText + "%");
    }
    sql += " order by name desc";
    db.page(req, res, sql, params);
})

user.post('/resetpwd',function (req, res) {
    co(function* () {
        var sql = "update t_user set password = ? where id = ?";
        yield db.run(sql, [md5("1234"), req.body.id]);
        res.end();
    }).catch(function (e) {
        res.status(500).send(e.message);
    })
})

user.post('/save',function (req, res) {
    co(function* () {
        var id = req.body.id;
        var name = req.body.name;
        var roles = req.body.roles;
        var sql = "select * from t_user where name = ?";
        var params = [name];
        if (id) {
            sql += " and id != ?";
            params.push(id);
        }
        var row = yield db.get(sql, params);
        if (row) throw new Error("用户名已存在");
        if (id) {
            sql = "update t_user set name = ?, roles = ? where id = ?";
            params = [name, roles, id];
        } else {
            params = [uuid(), name, roles, md5("1234"), formatDateTime()];
            sql = "insert into t_user(id,name,roles,password,regist_time) values(?,?,?,?,?)"
        }
        yield db.run(sql, params);
        res.end();
    }).catch(function (e) {
        res.status(500).send(e.message);
    })
})

user.post('/remove',function (req, res) {
    co(function* () {
        var sql = "delete from t_user where id = ?";
        yield db.run(sql, [req.body.id]);
        res.end();
    }).catch(function (e) {
        res.status(500).send(e.message);
    })
})

module.exports = user;