var express = require('express');
var app = express();

var port = process.env.PORT || 5000;


app.listen(port, function(err) {
    console.log('Running server on port: ' + port);
});

app.get('/', function(req, res) {
	res.send('Hello World!');
});