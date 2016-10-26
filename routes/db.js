var SQLite3 = require('sqlite3').verbose();
var db = new SQLite3.Database("xms.db");
module.exports = db;