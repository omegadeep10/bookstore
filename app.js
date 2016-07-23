var express = require('express');
var mysql = require('mysql');

var app = express();

var db_config = {
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b13e6ef2d95564',
    password: 'b3f85481',
    database: 'heroku_fb65db9133555c5'
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config);

  connection.connect(function(err) {          
    if(err) {             
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                     
  });                                     
                    
  connection.on('error', function(err) {
    console.log('DB ERROR: ', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();                         
    } 
    else {                                 
      throw err;                                 
    }
  });
}

handleDisconnect();

app.get('/', function(req, res) {
    connection.query('SELECT * FROM books', function(err, rows, fields){
        if (err) {
            console.log("Connection error: ", err);
        }
        res.send(['Hello World!', rows]);
    });
});



var port = process.env.PORT || 5000;

app.listen(port, function(err) {
    console.log('Running server on port: ' + port);
});

