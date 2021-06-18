var express = require('express');
var router = express.Router();
var Coin = require('../models/coin');
var Cart = require('../models/cart');

router.get('/add-to-cart/:id', function (req, res, next) {
    var coinId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart.items : {});
    
    Coin.findById(coinId, function (err, coin) {
        cart.add(coin, coin.id);
        console.log(cart);
        req.session.cart = cart;
        res.redirect('/');
    });
});

router.get('/shopping_cart', function (req, res, next) {
    console.log(req.session.cart);
    if (!req.session.cart) {
        return res.render('shopping_cart', {coins: null});
    }
    var cart = new Cart(req.session.cart.items);
    res.render('shopping_cart', {coins: cart.generateArray(), totalPrice: cart.totalPrice });
    //totalPrice: cart.totalPrice
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('danger', 'Please login');
      res.redirect('/users/login');
    }
}

module.exports = router;