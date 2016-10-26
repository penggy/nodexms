var page = require('./page');
var utils = require('../wx/utils');
var mysql = require('mysql');
var co = require('co');
exports.schools = function (req, res) {
    var sql = "select * from school where 1=1";
    var params = [];
    if (req.body.queryText) {
        sql += " and (description like ? or name like ?)"
        params.push("%" + req.body.queryText + "%", "%" + req.body.queryText + "%");
    }
    sql += " order by name desc";
    page(req, res, sql, params);
}

exports.save = function(req, res){
    var index = parseInt(req.body.index);
    var name = req.body.name;
    var description = req.body.description;
    
    co(function *(){
        try {
            var conn = yield utils.conn();

            if (index > 0){
                yield utils.exeSql(mysql.format("update school set `name` = ? ,`description` = ? where `index` = ?",[name,description,index]), conn);
            }else {
                var rows = yield utils.exeSql(mysql.format("select * from school where (name = ? )",[name]), conn);
                if (rows.length > 0){
                    res.status(500).send("学校名称已经存在");
                }else{
                    yield utils.exeSql(mysql.format("insert into school (`name`,`description`) values (?,?)",[name,description]), conn);
                }
            }
            
            res.end();
        } catch (error) {
            console.error(error.stack || error);
            res.status(500).send(error.message);
        }finally{
            conn && conn.release();
        }

    });
}


exports.remove = function (req, res) {
    var index = parseInt(req.body.index);
    
    co(function *(){
        try {
            var conn = yield utils.conn();
            yield utils.exeSql(mysql.format("delete from school where `index` = ?",[index]),conn);
            res.end();
        } catch (error) {
            console.error(error.stack || error);
            res.status(500).send(error.message);
        }finally{
            conn && conn.release();
        }
    });
}













