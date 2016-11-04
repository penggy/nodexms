var sqlite3 = require('sqlite3').verbose();
var co = require('co');
var Promise = require('promise');

function Database(){
    return Object(new sqlite3.Database("xms.db"));
}

exports.get = function(sql,params){
    return Promise.resolve({
        then : function(onFulfill,onReject){
            var db = new Database();
            db.get(sql,params,function(err,row){
                if(err){
                    db.close();
                    onReject(err);
                    return;
                }
                db.close();
                onFulfill(row);
            })
        }
    });
}

exports.all = function(sql,params){
    return Promise.resolve({
        then : function(onFulfill,onReject){
            var db = new Database();
            db.all(sql,params,function(err,rows){
                if(err){
                    db.close();
                    onReject(err);
                    return;
                }
                db.close();
                onFulfill(rows);
            })
        }
    });
}

exports.run = function(sql,params){
    return Promise.resolve({
        then : function(onFulfill,onReject){
            var db = new Database();
            db.run(sql,params,function(err){
                if(err){
                    db.close();
                    onReject(err);
                    return;
                }
                db.close();
                onFulfill(this);
            })
        }
    });
}

exports.exec = function(sql){
    return Promise.resolve({
        then : function(onFulfill,onReject){
            var db = new Database();
            db.exec(sql,function(err){
                if(err){
                    db.close();
                    onReject(err);
                    return;
                }
                db.close();
                onFulfill(this);
            })
        }
    });
}

exports.page = function (req, res, sql, params) {
    co(function*(){
        var page = parseInt(req.body.page);
        var limit = parseInt(req.body.rows);
        if (isNaN(page) || isNaN(limit)) throw new Error("分页数据缺失");
        var start = limit * (page - 1);
        var _sql = sql.replace(/\s*(o|O)(r|R)(d|D)(e|E)(r|R)\s+(b|B)(y|Y).*$/, "");
        cntSql = "select count(*) as count from (" + _sql + ")";
        var ret = {};
        var row = yield exports.get(cntSql,params);
        ret.total = row["count"];
        if (req.body.sort) {
            _sql += " order by " + req.body.sort + " " + req.body.order;
        }
        _sql += " limit ?,?";
        params.push(start, limit);
        var rows = yield exports.all(_sql,params);
        ret.rows = rows;
        res.json(ret);
    }).catch(function(err){
        res.status(500).send(err.message);
    })
}

exports.init = function(){
    var fs = require("fs");
    var sql = fs.readFileSync(__dirname + "/db.sql","utf-8");
    co(function*(){
        yield exports.exec(sql);
    }).catch(function(err){
        console.log(err);
    })
}