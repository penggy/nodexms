var sqlite3 = require('sqlite3').verbose();
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
                onFulfill(row);
                db.close();
            })
        }
    });
}