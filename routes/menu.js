var menu = express.Router();

function resortMenus(ids) {
    return Promise.resolve({
        then: function (onFulfill, onReject) {
            co(function* () {
                sql = "begin transaction;\n";
                for (var i = 0; i < ids.length; i++) {
                    var _sql = util.format("update t_menu set sort_number=%d where id='%s';\n", i + 1, ids[i]);
                    sql += _sql;
                }
                sql += "commit transaction;"
                yield db.exec(sql);
                onFulfill();
            }).catch(function (e) {
                onReject(e);
            })
        }
    })
}

function subMenus(pid, fetch) {
    return Promise.resolve({
        then: function (onFulfill, onReject) {
            co(function* () {
                var sql = "select * from t_menu where pid=? order by sort_number";
                var params = [pid];
                if (!pid) {
                    sql = "select * from t_menu where pid is null order by sort_number";
                    params = [];
                }
                var rows = yield db.all(sql, params);
                if (fetch) {
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var subRows = yield subMenus(row["id"], fetch);
                        row["subMenus"] = subRows;
                    }
                }
                onFulfill(rows);
            }).catch(function (e) {
                onReject(e);
            })
        }
    })
}

menu.get('/:pid?', function (req, res) {
    co(function* () {
        var pid = req.params.pid;
        var sql = "select * from t_menu where id=?"
        var params = [pid];
        var row = yield db.get(sql, params);
        res.render('menu', {
            pid: pid,
            pmenu: row
        });
    }).catch(function (e) {
        res.render('error', {
            message: e.message
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
    if (req.query.pid) {
        sql += " and pid=?";
        params.push(req.query.pid);
    } else {
        sql += " and pid is null";
    }
    sql += " order by sort_number";
    db.page(req, res, sql, params);
})

menu.post('/save', function (req, res) {
    var id = req.body.id;
    var pid = req.body.pid || null;
    var title = req.body.title;
    var path = req.body.path;
    var icon = req.body.icon;
    var roles = req.body.roles;
    var sort_number = parseInt(req.body.sort_number) || 1;
    co(function* () {
        var sql = "", params = [pid, title, path, icon, roles, sort_number];
        if (id) {
            sql = "update t_menu set pid=?,title=?,path=?,icon=?,roles=?,sort_number=?";
            sql += " where id=?";
            params.push(id);
        } else {
            id = uuid();
            sql = "insert into t_menu(id,pid,title,path,icon,roles,sort_number)";
            sql += " values(?,?,?,?,?,?,?)"
            params.splice(0, 0, id);
        }
        yield db.run(sql, params);
        if (pid) {
            sql = "select id from t_menu where pid=? order by sort_number";
            params = [pid];
        } else {
            sql = "select id from t_menu where pid is null order by sort_number";
            params = [];
        }
        var rows = yield db.all(sql, params);
        var ids = rows.map(function (row) {
            return row["id"];
        })
        if (sort_number < 1) sort_number = 1;
        if (sort_number > ids.length) sort_number = ids.length;
        var idx = ids.indexOf(id);
        ids.splice(idx, 1);
        ids.splice(sort_number - 1, 0, id);
        yield resortMenus(ids);
        res.end();
    }).catch(function (e) {
        res.status(500).send(e.message);
    })
})

menu.post('/tree', function (req, res) {
    co(function* () {
        var rows = yield subMenus("", true);
        res.json({ subMenus: rows });
    }).catch(function (e) {
        res.status(500).send(e.message);
    })
})

menu.post('/remove', function (req, res) {
    co(function* () {
        var row = yield db.get("select * from t_menu where id=?", req.body.id);
        if (!row) throw new Error("没有找到");
        yield db.run("delete from t_menu where id=?", req.body.id);
        var rows = yield subMenus(row["pid"], false);
        var ids = rows.map(function (row) {
            return row["id"];
        })
        yield resortMenus(ids);
        res.end();
    }).catch(function (e) {
        res.status(500).send(e.message);
    })
})
module.exports = menu;