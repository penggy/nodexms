module.exports = function(req,res,sql,params) {
    var page = parseInt(req.body.page);
    var limit = parseInt(req.body.rows);
    if(isNaN(page) || isNaN(limit)){
        res.status(500).send("分页数据缺失");
        return;
    }
    var start = limit * (page - 1);
    var _sql = sql.replace(/\s*(o|O)(r|R)(d|D)(e|E)(r|R)\s+(b|B)(y|Y).*$/,"");
    cntSql = "select count(*) from (" + _sql + ") as count";
    var ret = {};
    var db = require("./db");
    try{
        db.serialize(function(){
            db.get(cntSql,params,function(err,row){
                ret.total = row["count"];
            });
            if(req.body.sort){
                _sql += " order by " + req.body.sort + " " + req.body.order;
            }
            _sql += " limit ?,?";
            params.push(start,limit);
            db.all(_sql,params,function(err,rows){
                ret.rows = rows;
            })
            res.json(ret);
        })
    }catch(e){
        res.status(500).send(err.message);
    }finally{
        db.close();
    }

}