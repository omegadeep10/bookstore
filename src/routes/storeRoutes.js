var express = require('express');
var authRouter = express.Router();
var db;

authRouter.get('/', ensureAuthenticated, function(req, res) {
    res.render('store', { error_msg: req.flash('error_msg'), success_msg: req.flash('success_msg'), user: req.user });
});

//middleware to ensure user has logged in
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in.');
        res.redirect('/login');
    }
}

//this route takes in a database connection.
module.exports = function(dbConnection){
    db = dbConnection;
    return authRouter;
};