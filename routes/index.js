var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongo = require('mongodb');
var User = require('../models/users.js');
var stormpath = require('stormpath');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'CRG-Guestbook' });
  console.log('This is the index.js file')
});

router.get('/auth/facebook', function(req, res, next){
    req.passport.authenticate('facebook')(req, res, next);
});

router.get('/auth/facebook/callback', function(req, res, next){
    req.passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login' }
    )(req, res, next);
});

router.get('/auth/twitter', function(req, res, next){
    req.passport.authenticate('twitter')(req, res, next);
});

router.get('/auth/twitter/callback', function(req, res, next){
    req.passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/login' }
    )(req, res, next);
});

module.exports = router;
