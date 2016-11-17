var mysql = require('mysql');
var co = require('co');
var Promise = require('promise');

var pool = mysql.createPool({
	connectionLimit: 10,
    host: 'ucbaby.easydss.com',
    user: 'root',
    password: 'root',
    database: 'ukanbaby',
    port: 3306,
    acquireTimeout: 15000
});

exports.query = function(sql,params) {
    return Promise.resolve({
        then : function(onFulfill,onReject){
            pool.query(sql,params,function(err,results,fields){
                if(err){
                    onReject(err);
                    return;
                }
                onFulfill({
                    results : results,
                    fields : fields
                });
            })
        }
    });
}

exports.query = function(conn,sql,params) {
    return Promise.resolve({
        then : function(onFulfill,onReject){
            conn.query(sql,params,function(err,results,fields){
                if(err){
                    onReject(err);
                    return;
                }
                onFulfill({
                    results : results,
                    fields : fields
                });
            })
        }
    });
}

exports.run = function(sql,params) {
    return Promise.resolve({
        then : function(onFulfill,onReject){
            pool.query(sql,params,function(err,result){
                if(err){
                    onReject(err);
                    return;
                }
                onFulfill(result);
            })
        }
    });
}

exports.run = function(conn,sql,params) {
    return Promise.resolve({
        then : function(onFulfill,onReject){
            conn.query(sql,params,function(err,result){
                if(err){
                    onReject(err);
                    return;
                }
                onFulfill(result);
            })
        }
    });
}

exports.getConnection = function(){
    return Promise.resolve({
        then : function(onFulfill,onReject){
            pool.getConnection(function(err,conn){
                if(err){
                    onReject(err);
                    return;
                }
                onFulfill(conn);
            })
        }
    });
}

exports.beginTransaction = function(conn){
    return Promise.resolve({
        then : function(onFulfill, onReject){
            conn.beginTransaction(function(err){
                if(err){
                    onReject(err);
                    return;
                }
                onFulfill();
            })
        }
    });
}

exports.commit = function(conn){
    return Promise.resolve({
        then : function(onFulfill,onReject){
            conn.commit(function(err){
                if(err){
                    onReject(err);
                    return;
                }
                onFulfill();
            })
        }
    })
}

