// Module dependencies
const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const flash = require('connect-flash');
const passport = require('passport');

// Connect to database
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

// Check connection
db.once('open',function(){
    console.log("Connected to MongoDB");
});

// Check for DB errors
db.on('error', function(err){
    console.log(err);
});

// Init app
const app = express();

//Express Messages middleware
app.use(session({
    secret: 'woot',
    resave: false, 
    saveUninitialized: true
}));
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Create model
let Coin = require('./models/coin');
const { title } = require('process');

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true, limit: '10mb'})); //Parse URL-encoded bodies

// parse application/json
app.use(express.json({limit: '10mb'}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});
  

// Load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));


// Home route
app.get('/',function(req, res){
    res.render('index', {
        title: 'Hello'
    });
});

// About route
app.get('/about',function(req,res){
    res.render('about',{
        title: 'About'
     });
});

// Load Coins page
app.get('/coins',function(req, res){
    Coin.find({}, function(err,coins){
        if(err){
            console.log(err);
        } else {
            res.render('coins',{
                title:'Coins',
                coins: coins
            });
        }
        
    });   
});
app.post('/search',function(req, res){
    var query = req.body.search;
    Coin.find({$text: {$search: query}}, function(err,coins){
        if(err){
            console.log(err);
        } else {
            res.render('coins',{
                title:'Coins',
                coins: coins
            });
        }
        
    });   
});

app.get('/mycoins',function(req, res){
    Coin.find({}, function(err,coins){
        if(err){
            console.log(err);
        } else {
            res.render('mycoins',{
                title:'My coins',
                coins: coins
            });
        }
        
    });   
});

// Route files
var coins = require('./routes/coins');
var users = require('./routes/users');
var routes = require('./routes/index');
const user = require('./models/user');
const { Console } = require('console');
app.use('/coins', coins);
app.use('/users', users);
app.use('/', routes);

// Start server
app.listen(3000,function(){
    console.log('Server started on port 3000...');
});