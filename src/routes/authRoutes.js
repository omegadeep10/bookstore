var express = require('express');
var authRouter = express.Router();

authRouter.get('/', function(req, res) {
    res.render('index');
});

authRouter.get('/register', function(req, res) {
    res.render('register');
});

module.exports = authRouter;