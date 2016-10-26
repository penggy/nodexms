var db = require("./db");

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
    db.query(cntSql, params, function (err, rows, fields) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        var total = rows[0][fields[0].name];
        if(req.body.sort){
            _sql += " order by " + req.body.sort + " " + req.body.order;
        }
        _sql += " limit ?,?";
        params.push(start,limit);
        db.query(_sql,params,function(err,rows,fields){
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.json({
                total : total,
                rows : rows
            });
        });
    });

}