if (process.env.ENVIRONMENT !== "production") require('dotenv').config();

var express = require('express');
var stormpath = require('express-stormpath');
var app = express();
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
var stormpath = require('express-stormpath');
var hbs = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/userlist');
var User = require('./models/users')

mongoose.connection.once('connected', function() {
  console.log("Connected to database")
});

var routes = require('./routes/index');
var users = require('./routes/users');

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(stormpath.init(app, { website: true }));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'Flyjin88',
  saveUninitialized: true,
  resave: true
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


app.use(flash());

app.use(function (req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

app.get('/userlist', function (req, res) {
  console.log('I received a GET request');

  User.find({}, function (err, docs) {
    if (err) throw err;
      res.json(docs);
  });
});

app.post('/userlist', function (req, res) {
  console.log(req.body);
  var msg = new User(
    { name: req.body.name,
      email: req.body.email,
      message: req.body.message});
  msg.save(function(err, user) {
    res.json(user);
  });
});

app.delete('/userlist/:id', function (req, res) {
  var id = req.params.id;
  User.remove({_id: mongodb.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});

app.get('/userlist/:id', function (req, res) {
  var id = req.params.id;
  User.findOne({_id: mongodb.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});

app.put('/userlist/:id', function (req, res) {
  var id = req.params.id;
  User.findAndModify({
    query: {_id: mongodb.ObjectId(id)},
    update: {$set: {name: req.body.name, email: req.body.email, message: req.body.message}},
    new: true}, function (err, doc) {
      res.json(doc);
    }
  );
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.on('stormpath.ready', function() {
  app.listen(process.env.PORT || 3000);
});

module.exports = app;
