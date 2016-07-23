var express = require('express');
var mysql = require('mysql');

var app = express();

var conn = mysql.createConnection({
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b13e6ef2d95564',
    password: 'b3f85481',
    database: 'heroku_fb65db9133555c5'
});

conn.connect();

app.get('/', function(req, res) {
    conn.query('SELECT * FROM books', function(err, rows, fields){
        if (err) {
            console.log("Connection error: ", err);
            throw err;
        }
        response.send(['Hello World!', rows]);
    });
    res.send('Hello World!');
});



var port = process.env.PORT || 5000;

app.listen(port, function(err) {
    console.log('Running server on port: ' + port);
});

