var express = require('express');
var authRouter = express.Router();

authRouter.get('/', function(req, res) {
    res.render('index');
});

authRouter.get('/register', function(req, res) {
    res.render('register');
});

authRouter.get('/login', function(req, res) {
    res.render('login');
});

authRouter.post('/register', function(req, res) {
    var email = req.body.email;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var password = req.body.password;
    var password2 = req.body.password2;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var zipcode = req.body.zip;
    var phone = req.body.phone;
    var card_type = req.body.card_type;
    var card_number = req.body.card_number;

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
            errors: errors
        })
    }
    else {
        var userInfo = {
            first_name: first_name,
            last_name: last_name,
            address: address,
            city: city,
            state: state,
            zip: zipcode,
            phone: phone,
            email: email,
            password: password,
            credit_card_type: card_type,
            credit_card_number: card_number
        }
        req.app.get('db').query('INSERT INTO members SET ?', userInfo, function(err, result) {
            if (err) {
                console.log(err);
                throw err;
            }
        });
        res.render('register', {
            success: true
        })
    }
});


module.exports = authRouter;