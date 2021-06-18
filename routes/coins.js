var express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
let Coin = require('../models/coin');
const user = require('../models/user');
let User = require('../models/user');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']

// Add coin route
router.get('/add', ensureAuthenticated, function(req,res){
    res.render('add_coin',{
        title: 'Add coin'
     });
});

// Load single coin page
router.get('/:id', function(req,res){
    Coin.findById(req.params.id, function(err, coin){
        res.render('coin',{
            title:'coin',
            coin:coin
        });
    });
});

router.get('/mycoins', ensureAuthenticated, function(req,res){

});

// Submit/Add coin to DB
router.post('/add', ensureAuthenticated , [
    check('name', 'Name is required.').notEmpty(),
    check('denomination', 'Denomination is required.').notEmpty(),
    check('mint','Mint is required.').notEmpty(),
    check('cover', 'Image is required.').notEmpty(),
    check('price', 'Price is required.').notEmpty(),
    check('price', 'Price should be a number.').isNumeric(),],
    async (req, res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        res.render('add_coin', {
            errors:errors.array()
        });
    } 
        
        let coin = new Coin();
        coin.name = req.body.name;
        coin.denomination = req.body.denomination;
        coin.mint = req.body.mint;
        coin.price = req.body.price;
        coin.country = req.body.country;
        coin.description = req.body.description;
        coin.userID = req.user._id;
        saveCover(coin, req.body.cover);

        coin.save(function(err){
            if(err) {
                console.log(err);
                return;
            }
            else {
                  req.flash('success','Coin added')
                  res.redirect('/coins');
            }
        });
        return;
});

// Save image
function saveCover(coin, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      coin.coverImage = new Buffer.from(cover.data, 'base64')
      coin.coverImageType = cover.type
    }
}

// Load edit form for coin
router.get('/edit/:id' ,ensureAuthenticated ,function(req,res) {
    Coin.findById(req.params.id, function(err, coin) {
        res.render('edit_coin', {
            coin:coin
        });
    });
});


// Edit coin submit POST route
router.post('/edit/:id', [
    check('name', 'Name is required.').notEmpty(),
    check('denomination', 'Denomination is required.').notEmpty(),
    check('mint','Mint is required.').notEmpty(),],
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            Coin.findById(req.params.id, function(err, coin) {
                res.render('edit_coin', {
                    coin:coin,
                    errors:errors.array()
                });
            });
        }
        
        else {
            try {
                const coin = {
                name: req.body.name,
                denomination: req.body.denomination,
                mint: req.body.mint,
                price: req.body.price,
                country: req.body.country,
                description: req.body.description,
            };
            if(req.body.cover == "") {
                console.log("Tuscia")
            }
            else {
                saveCover(coin, req.body.cover);
            }
        
            let query = { _id: req.params.id }
        
            const update = await Coin.update(query, coin);
            if (update) {
                req.flash('success', 'Coin Updated.');
                res.redirect('/coins');
            } return;
        
            } catch (e) {
            res.send(e);
            }
        }
        
});



router.delete('/:id' ,ensureAuthenticated , function(req, res){
    let query = {_id:req.params.id}
    Coin.remove(query, function(err){
        if(err){
            console.log(err);
        }
        res.send('Succesfully deleted');
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('danger', 'Please login');
      res.redirect('/users/login');
    }
}
module.exports = router;