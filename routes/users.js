const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

//bring in user model
let User = require("../models/user");

// Register Form
router.get('/register', async (req, res) => {
    res.render('register');
});

//Add user to db
router.post('/register', [
    //Name validation
    check('name', 'Name is required').notEmpty(),
    //Correct Email validation
    check('email', 'Email is not valid').isEmail(),
    //Username validation
    check('username', 'Username is required').notEmpty(),
    //Email validation
    check('email', 'Email is required').notEmpty(),
    //Password validation
    check('password','Password is required').notEmpty(),
    //Custom password validation that requires req value
    check('password1').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
    }),
], async (req, res)=> {
    const errors = validationResult(req)
    
    if(!errors.isEmpty()) {
        res.render('register', {
            errors:errors.array()
        });
    }
        let user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.username = req.body.username;
        user.password = req.body.password;
        user.isAdmin = false;

        bcrypt.genSalt(10, function(err,salt){
            bcrypt.hash( user.password, salt, function(err, hash){
                if(err){
                    console.log(err);
                }
                user.password = hash;
                user.save(function(err){
                    if(err){
                        console.log(err);
                    }
                    else {
                        req.flash('success', 'Registration successful.')
                        res.redirect('/users/login');
                    }
                });
            });
        });
});

// Login Form
router.get('/login', async (req, res) => {
    res.render('login');
  });
  
  // Login Process
router.post('/login', async (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
});
  // Logout
router.get('/logout', async (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});
 // Profile page
 router.get('/:id', ensureAuthenticated , function(req,res){
    User.findById(req.params.id, function(err, user){
        res.render('user',{
            title:'user',
            user:user
        });
    });
});

// Change password
router.post('/changepassword/:id',[ 
    check('oldPassword','Old password is required').notEmpty(),
    check('password','New password is required').notEmpty(),
    check('password1','Password confirmation is required').notEmpty(),
    check('password1').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
    }),
    ], async (req, res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        User.findById(req.params.id, function(err, user){
            res.render('user',{
                title:'user',
                user:user,
                errors:errors.array()
            });
        });  
    }
    User.findById(req.params.id, async function(err, user){
        bcrypt.compare(req.body.oldPassword, user.password, function(err, isMatch){
            if(isMatch){
                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(req.body.password, salt, function(err, hash){
                        console.log(req.body.password);
                        console.log(hash);
                        let query = { _id: req.params.id};
                        let values = { $set: {password: hash}};
                        User.updateOne(query, values, function(err){
                            console.log("password changed");
                        });
                        req.flash('success', 'Password changed, you may login with your new password');
                        res.render('login');                      
                    });
                });
            }
        });
    });
});
// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('danger', 'Please login.');
      res.redirect('/users/login');
    }
  }
module.exports = router;