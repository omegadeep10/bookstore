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
            },
    }, function(error, results) {
        db.query('CALL getCartTotal(?)', [req.user.email], function(err, rows, fields) {
            if (err) throw err;
            res.render('store', {
                error_msg: req.flash('error_msg'), 
                success_msg: req.flash('success_msg'), 
                user: req.user,
                books: results.books,
                cart: results.cart,
                subjects: results.subjects,
                cart_total: rows
            });
        });
    });
});

authRouter.get('/orders', ensureAuthenticated, function(req, res) {
    db.query('CALL getOrders(?)', [req.user.email], function(error, results, fields) {
        if (error) throw error;
        res.render('orders', {
            error_msg: req.flash('error_msg'), 
            success_msg: req.flash('success_msg'), 
            user: req.user,
            orders: results
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
        db.query('CALL getCartTotal(?)', [req.user.email], function(err, rows, fields) {
            if (err) throw err;
            res.render('store', {
                error_msg: req.flash('error_msg'), 
                success_msg: req.flash('success_msg'), 
                user: req.user,
                books: results.books,
                cart: results.cart,
                subjects: results.subjects,
                cart_total: rows
            });
        });
    });
});

authRouter.get('/one-click', ensureAuthenticated, function(req, res) {
    db.query('CALL oneClickCheckout(?)', [req.user.email], function(error, results, fields) {
        if (error) throw error;
        req.flash('success_msg', 'Your order has been placed.');
        res.redirect('/store');
    });
});

authRouter.get('/checkout', ensureAuthenticated, function(req, res) {
    res.render('checkout', {
        error_msg: req.flash('error_msg'), 
        success_msg: req.flash('success_msg'), 
        user: req.user
    });
});

authRouter.post('/checkout', function(req, res) {

    req.checkBody('address', 'Address required').notEmpty();
    req.checkBody('city', 'City required').notEmpty();
    req.checkBody('state', 'State required').notEmpty();
    req.checkBody('zip', 'Zipcode required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors,
            error_msg: req.flash('error_msg'), 
            success_msg: req.flash('success_msg'),
            user: req.user
        })
    }
    else { 
        db.query('CALL normalCheckout(?, ?, ?, ?, ?)', 
            [req.user.email, req.body.address, req.body.city, req.body.state, req.body.zip], 
            function(err, result) {
            if (err) throw err;
        });
        req.flash('success_msg', 'Your order has been successfully placed.');
        res.render('checkout', {
            error_msg: req.flash('error_msg'), 
            success_msg: req.flash('success_msg'),
            user: req.user
        });
    }
});

authRouter.post('/search', ensureAuthenticated, function(req, res) {
    var searchTerm =  '%' + req.body.search + '%';
    async.parallel({
        books: function(callback) {
                db.query('SELECT * FROM books WHERE title LIKE ' + db.escape(searchTerm) + ' OR price LIKE ' + db.escape(searchTerm) + ' OR author LIKE ' + db.escape(searchTerm) + ' OR isbn LIKE ' + db.escape(searchTerm) + ';', 
                    function(error, results, fields) {
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
        db.query('CALL getCartTotal(?)', [req.user.email], function(err, rows, fields) {
            if (err) throw err;
            res.render('store', {
                error_msg: req.flash('error_msg'), 
                success_msg: req.flash('success_msg'), 
                user: req.user,
                books: results.books,
                cart: results.cart,
                subjects: results.subjects,
                cart_total: rows
            });
        });
    });
});

//this route takes in a database connection.
module.exports = function(dbConnection){
    db = dbConnection;
    return authRouter;
};