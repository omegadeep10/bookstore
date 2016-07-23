var express = require('express');
var mysql = require('mysql');

var app = express();
var port = process.env.PORT || 5000;

app.use(express.static('public'));
app.set('views', './src/views');
app.set('view engine', 'ejs');

var pool = mysql.createPool({
    connectionLimit: 5,
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b13e6ef2d95564',
    password: 'b3f85481',
    database: 'heroku_fb65db9133555c5'
});

app.get('/', function(req, res) {
    pool.query('SELECT * FROM books', function(err, rows, fields){
        if (err) {
            console.log("Connection error: ", err);
        }
        res.render('index', {data: rows});
    });
});

app.listen(port, function(err) {
    console.log('Running server on port: ' + port);
});

