var co = require('co');
var express = require('express');
var menu = express.Router();

module.exports = menu;

menu.get('/',function(req,res){
    res.render('menu');
})

menu.post('/menus',function (req, res) {
    var sql = "select * from t_menu where 1=1";
    var params = [];
    if (req.body.queryText) {
        sql += " and (title like ? or path like ? or roles like ?)"
        params.push("%" + req.body.queryText + "%");
        params.push("%" + req.body.queryText + "%");
        params.push("%" + req.body.queryText + "%");
    }
    sql += " order by title desc";
    db.page(req, res, sql, params);
})