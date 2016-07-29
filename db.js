var mysql = require('mysql');

//mysql initialization
var pool = mysql.createPool({
    connectionLimit: 4,
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b13e6ef2d95564',
    password: 'b3f85481',
    database: 'heroku_fb65db9133555c5'
});

module.exports = pool;