var express = require('express');
var app = express();

var port = 3000;

app.use(express.static('public'));
app.use(express.static('src/views'));

app.listen(300, function(err) {
    console.log('Running server on port: ' + port);
});