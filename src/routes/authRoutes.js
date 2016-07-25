var express = require('express');
var authRouter = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
  function(req, email, password, done) {
    db.query('SELECT * FROM members WHERE email = ?', [email], function(error, results, fields) {
        if (error) {
            return done(error);
        }
        else if (!results.length) {
            return done(null, false, req.flash('error_msg', 'Invalid email'));
        }

        if (!(results[0].password == password)) {
            return done(null, false, req.flash('error_msg', 'Invalid password'));
        }

        return done(null, results[0]);
    });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.user_id);
});

    // used to deserialize the user
passport.deserializeUser(function(id, done) {
    db.query("SELECT * FROM members WHERE user_id = ?", [id], function(error, results, fields){
        if (error) throw error;
        done(error, results[0]);
    });
});


authRouter.get('/', function(req, res) {
    res.render('index', { user: req.user });
});

authRouter.get('/register', function(req, res) {
    res.render('register', { user: req.user });
});

authRouter.get('/login', function(req, res) {
    res.render('login', { error_msg: req.flash('error_msg'), success_msg: req.flash('success_msg'), user: req.user });
});

authRouter.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'Successfully Logged Out');
    res.render('login', { error_msg: req.flash('error_msg'), success_msg: req.flash('success_msg'), user: req.user });
});

authRouter.post('/register', function(req, res) {
    var userInfo = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password,
            credit_card_type: req.body.card_type,
            credit_card_number: req.body.card_number
        }

    req.checkBody('email', 'Email required').notEmpty();
    req.checkBody('first_name', 'First Name required').notEmpty();
    req.checkBody('last_name', 'Last Name required').notEmpty();
    req.checkBody('password', 'Password required').notEmpty();
    req.checkBody('password2', 'Password must match').notEmpty().equals(req.body.password);
    req.checkBody('address', 'Address required').notEmpty();
    req.checkBody('city', 'City required').notEmpty();
    req.checkBody('state', 'State required').notEmpty();
    req.checkBody('zip', 'Zipcode required').notEmpty();
    req.checkBody('phone', 'Phone required').notEmpty();
    req.checkBody('card_type', 'Card type required').notEmpty();
    req.checkBody('card_number', 'Card number required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors,
            user: req.user
        })
    }
    else { 
        db.query('INSERT INTO members SET ?', userInfo, function(err, result) {
            if (err) throw err;
        });
        res.render('register', {
            success: true,
            user: req.user
        })
    }
});

authRouter.post('/login', 
    passport.authenticate('local', { successRedirect: '/store', failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        req.flash('success_msg', 'Now logged in.');
    });

module.exports = function(dbConnection){
    db = dbConnection;
    return authRouter;
};