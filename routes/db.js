var mysql = require('mysql');
var db = mysql.createPool({
	connectionLimit: 10,
    host: 'ucbaby.easydss.com',
    user: 'root',
    password: 'root',
    database: 'ukanbaby',
    port: 3306,
    acquireTimeout: 30000 // 30s
});
module.exports = db;