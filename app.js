var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var pool = require('./db');



//routes 
var authRoutes = require('./src/routes/authRoutes');

//init new express instance, setup port variable
var app = express();
//make database pool available throughout the app
app.set('db', pool);

//declare public, view directory and view engine
app.use(express.static('public'));
app.set('views', './src/views');
app.set('view engine', 'ejs');

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//express session middleware
app.use(session({
    secret: '5asd30rmp2',
    saveUninitialized: true,
    resave: true
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash());
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success-msg');
    res.locals.error_msg = req.flash('error-msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', authRoutes);


/*app.get('/', function(req, res) {
    pool.query('SELECT * FROM books', function(err, rows, fields){
        if (err) {
            console.log("Connection error: ", err);
        }
        res.render('index', {data: rows});
    });
});*/

var port = process.env.PORT || 5000;
app.listen(port, function(err) {
    console.log('Running server on port: ' + port);
});

