var co = require('co');
var express = require('express');
var menu = express.Router();

menu.get('/:pid?', function (req, res) {
    co(function*(){
        var pid = req.params.pid;
        var sql = "select * from t_menu where id=?"
        var params = [pid];
        var row = yield db.get(sql,params);
        res.render('menu',{
            pid : pid,
            pmenu : row
        });
    }).catch(function(e){
        res.render('error',{
            message : e.message
        })
    })
})

menu.post('/menus', function (req, res) {
    var sql = "select * from t_menu where 1=1";
    var params = [];
    if (req.body.queryText) {
        sql += " and (title like ? or path like ? or roles like ?)"
        params.push("%" + req.body.queryText + "%");
        params.push("%" + req.body.queryText + "%");
        params.push("%" + req.body.queryText + "%");
    }
    if(req.query.pid){
        sql += " and pid=?";
        params.push(req.query.pid);
    }else{
        sql += " and pid is null";
    }
    sql += " order by sort_number";
    db.page(req, res, sql, params);
})

menu.post('/save', function (req, res) {
    co(function* () {
        var id = req.body.id;
        var pid = req.body.pid || null;
        var title = req.body.title;
        var path = req.body.path;
        var icon = req.body.icon;
        var roles = req.body.roles;
        var sort_number = parseInt(req.body.sort_number)||1;
        var sql = "", params = [pid,title, path, icon, roles, sort_number];
        if (id) {
            sql = "update t_menu set pid=?,title=?,path=?,icon=?,roles=?,sort_number=?";
            sql += " where id=?";
            params.push(id);
        } else {
            id = uuid();
            sql = "insert into t_menu(id,pid,title,path,icon,roles,sort_number)";
            sql +=" values(?,?,?,?,?,?,?)"
            params.splice(0,0,id);
        }
        yield db.run(sql,params);
        if(pid){
            sql = "select id from t_menu where pid=? order by sort_number";
            params = [pid];
        }else{
            sql = "select id from t_menu where pid is null order by sort_number";
            params = [];
        }
        var rows = yield db.all(sql,params);
        var ids = rows.map(function(row){
            return row["id"];
        })
        if(sort_number < 1) sort_number = 1;
        if(sort_number > ids.length) sort_number = ids.length;
        var idx = ids.indexOf(id);
        ids.splice(idx,1);
        ids.splice(sort_number-1,0,id);
        sql = "begin transaction;\n";
        var util = require('util');
        for(var i=0;i<rows.length;i++){
            var _sql = util.format("update t_menu set sort_number=%d where id='%s';\n",i+1,ids[i]);
            sql += _sql;
        }
        sql += "commit transaction;"
        yield db.exec(sql);
        res.end();
    }).catch(function (e) {
        res.status(500).send(e.message);
    })
})
module.exports = menu;