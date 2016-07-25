var express = require('express');
var authRouter = express.Router();
var async = require('async');
var db;

//middleware to ensure user has logged in
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in.');
        res.redirect('/login');
    }
}

authRouter.get('/', ensureAuthenticated, function(req, res) {
    async.parallel({
        books: function(callback) {
                db.query('SELECT * FROM books LIMIT 20', function(error, results, fields) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(null, results);
                    }
                });
            },
        cart: function(callback) {
                db.query('CALL getCartForUserEmail(?);', [req.user.email], function(error, results, fields) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(null, results);
                    }
                });
            },
        subjects: function(callback) {
                db.query('SELECT DISTINCT subject FROM books;', function(error, results, fields) {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(null, results);
                    }
                });
            }
    }, function(error, results) {
        res.render('store', {
            error_msg: req.flash('error_msg'), 
            success_msg: req.flash('success_msg'), 
            user: req.user,
            books: results.books,
            cart: results.cart,
            subjects: results.subjects
        });
    });
});

//this route takes in a database connection.
module.exports = function(dbConnection){
    db = dbConnection;
    return authRouter;
};