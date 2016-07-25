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
    //ensures all queries complete before res.render
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
                db.query('SELECT DISTINCT subject FROM books ORDER BY subject;', function(error, results, fields) {
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

//removes a specific cart entry
authRouter.get('/cart/remove/:cart_id', ensureAuthenticated, function(req, res) {
    var cart_id = req.params.cart_id;
    db.query('DELETE FROM cart WHERE cart_id = ?', [cart_id], function(error, results, fields) {
        if (error) throw error;
    });
    res.redirect('/store');
});

//adds cart entry OR updates the quantity += one if the book is already in the user's cart
authRouter.get('/cart/add/:book_id', ensureAuthenticated, function(req, res) {
    var book_id = req.params.book_id;
    db.query('CALL addToCart(?, ?);', [req.user.email, book_id], function(error, results, fields) {
        if (error) throw error;
    });
    res.redirect('/store');
});

//returns filtered list of books, sorted by subjects
authRouter.get('/sort/:subject', ensureAuthenticated, function(req, res) {
    var subject = req.params.subject;
    async.parallel({
        books: function(callback) {
                db.query('SELECT * FROM books WHERE subject = ? LIMIT 20', [subject], function(error, results, fields) {
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
                db.query('SELECT DISTINCT subject FROM books ORDER BY subject;', function(error, results, fields) {
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