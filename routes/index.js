"use strict";

let express = require('express'),
    passport = require('passport'),
    moment = require('moment'),
    queries = require('../server/queries'),
    xml = require('../server/xml'),
    email = require('../server/email'),
    fs = require('fs'),
    router = express.Router();

router.get('/', function (req, res, next) {
  return res.render('pages/index', {
    username: req.user ? req.user.username : null
  });
});

router.get('/about', function (req, res, next) {
  return res.render('pages/about', {
    username: req.user ? req.user.username : null
  });
});

router.get('/404', function (req, res, next) {
  return res.render('pages/404', {
    username: req.user ? req.user.username : null
  });
});

router.get('/500', function (req, res, next) {
  return res.render('pages/500', {
    username: req.user ? req.user.username : null
  });
});

router.get('/faq', function (req, res, next) {
  return res.render('pages/faq', {
    username: req.user ? req.user.username : null
  });
});

router.get('/howitworks', function (req, res, next) {
  return res.render('pages/howitworks', {
    username: req.user ? req.user.username : null
  });
});

router.get('/news', function (req, res, next) {
  return res.render('pages/news', {
    username: req.user ? req.user.username : null
  });
});

router.get('/contact', function (req, res, next) {
  return res.render('pages/contact', {
    username: req.user ? req.user.username : null
  });
});

router.get('/privacypolicy', function (req, res, next) {
  return res.render('pages/privacypolicy', {
    username: req.user ? req.user.username : null
  });
});

router.get('/tos', function (req, res, next) {
  return res.render('pages/tos', {
    username: req.user ? req.user.username : null
  });
});

router.get('/upload', isLoggedIn, function (req, res, next) {
  return res.render('pages/upload', {
    username: req.user ? req.user.username : null,
    title: res.locals.title,
    author: res.locals.author,
    genre: res.locals.genre,
    lines: res.locals.lines,
    poem_check: res.locals.poem_check
  });
});

router.get('/encodesubmission', isLoggedIn, function (req, res, next) {
  return res.render('pages/encodesubmission', {
    username: req.user ? req.user.username : null
  });
});

router.get('/compare/:poem_id/:type_1/:version_1/:type_2/:version_2', isLoggedIn, queries.getEncodingsForCompare, function (req, res, next) {
  return res.render('pages/compare', {
    username: req.user ? req.user.username : null,
    encodings: res.locals.encodings,
    poem_id: req.params.poem_id
  });
});

router.get('/poem/:id', isLoggedIn, queries.getPoem, queries.getEncodingsByPoem, function (req, res, next) {
  return res.render('pages/poem', {
    moment: moment,
    username: req.user ? req.user.username : null,
    poem: res.locals.poem,
    encodings: res.locals.encodings
  });
});

router.get('/poem/:poem_id/encoding/:encoded_id', isLoggedIn, queries.getEncoding, function (req, res, next) {
  return res.render('pages/userencoding', {
    moment: moment,
    username: req.user ? req.user.username : null,
    encoding: res.locals.poemcoding
  });
});

router.get('/search', isLoggedIn, queries.searchPoems, function (req, res, next) {
  let search = req.query.q || "",
      total = parseInt(res.locals.poems.total),
      page = parseInt(res.locals.poems.page),
      pageSize = parseInt(res.locals.poems.pageSize);
  let totalPages = total > 0 ? Math.ceil(total/pageSize) : 1;
  let pageBottom = page - 3 > 0 ? page - 3 : 1,
      pageTop = page + 7 > totalPages ? totalPages : page + 7;
  return res.render('pages/search', {
    moment: moment,
    username: req.user ? req.user.username : null,
    poems: res.locals.poems.poems,
    total: total,
    page: page,
    pageSize: pageSize,
    pageTop: pageTop,
    pageBottom: pageBottom,
    totalPages: totalPages,
    search: search,
    encodedSearch: encodeURIComponent(search)
  });
});

router.get('/settings', isLoggedIn, function (req, res, next) {
  return res.render('pages/settings', {
    username: req.user ? req.user.username : null,
    message: res.locals.message
  });
});

router.get('/encode/:id', isLoggedIn, queries.getPoem, function (req, res, next) {
  return res.render('pages/encode', {
    username: req.user ? req.user.username : null,
    poem: res.locals.poem
  });
});

router.get('/profile/:username', isLoggedIn, queries.profileInfo, queries.getPoemsByUser, queries.getEncodingsByUser, function (req, res, next) {
  return res.render('pages/profile', {
    moment: moment,
    username: req.user ? req.user.username : null,
    message: res.locals.message,
    profile: res.locals.profileInfo,
    poems: res.locals.poems,
    encodings: res.locals.encodings
  });
});

router.get('/signup', isNotLoggedIn, function (req, res, next) {
  return res.render('pages/signup', {
    message: req.flash('signupMessage'),
    first_name: res.locals.first_name,
    last_name: res.locals.last_name,
    email: res.locals.email,
    username: res.locals.username
  });
});

router.get('/resetpassword', isNotLoggedIn, function (req, res, next) {
  return res.render('pages/forgotpassword', {
    message: res.locals.message,
    email: res.locals.email,
    username: res.locals.username
  });
});

router.get('/forgotusername', isNotLoggedIn, function (req, res, next) {
  return res.render('pages/forgotusername', {
    message: res.locals.message,
    email: res.locals.email
  });
});

router.get('/login', isNotLoggedIn, function (req, res, next) {
  return res.render('pages/login', {
    message: req.flash('loginMessage'),
    username: res.locals.username
  });
});

router.get('/logout', function (req, res, next) {  
  req.logout();
  return res.redirect('/');
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local-login', {failureFlash: true}, function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/profile/' + user.username);
    });
  })(req, res, next);
});

router.post('/signup', function (req, res, next) {
  passport.authenticate('local-signup', {failureFlash: true}, function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/signup'); }
    email.verifyAccount(req.body.email, user.id, user.secret, function (err, status) {
      if (err) { return next(err); }
      return res.render('pages/thankyou');
    });
  })(req, res, next);
});

router.post('/submit', queries.addPoem, function (req, res, next) {
  return res.redirect('/poem/' + res.locals.poem.id);
});

router.post('/submitencode', queries.addPoem, function (req, res, next) {
  return res.redirect('/encode/' + res.locals.poem.id);
});

router.post('/poem/:id/encode', queries.encodePoem, function (req, res, next) {
  return res.redirect('/poem/' + req.params.id);
});

router.post('/compare/:poem_id', function (req, res, next) {
  if(req.body.optRadio1 && req.body.optRadio2)
    return res.redirect('/compare/' + req.params.poem_id + "/" + req.body.optRadio1 + "/" + req.body.optRadio2);
  return res.redirect('/poem/' + req.params.poem_id);
});

router.post('/validate', function (req, res, next) {
  xml.validate(req.body.original, req.body.encoded, function (status, message) {
    return res.json({status: status, message: message});
  });
});

router.post('/password/change', queries.changePassword, function (req, res, next) {
  return res.redirect('/settings');
});

router.post('/password/reset', queries.resetPassword, function (req, res, next) {
  email.resetPassword(req.body.email, res.locals.password, function (err, status) {
    if (err) { return next(err); }
    return res.render('pages/resetconfirm', {
      username: req.user ? req.user.username : null
    });
  });
});

router.post('/username/forgot', queries.findUsername, function (req, res, next) {
  email.findUsername(req.body.email, res.locals.username, function (err, status) {
    if (err) { return next(err); }
    return res.render('pages/forgotusernameconfirm', {
      username: req.user ? req.user.username : null
    });
  });
});

router.get('/verification/:user_id/:user_secret', queries.validateAccount, function (req, res, next) {
  return res.render('pages/emailvalid');
});

module.exports = router;

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.valid) {
      return next();
    }
    return res.render('pages/validationincomplete');
  }
  res.redirect('/');
}

function isNotLoggedIn (req, res, next) {
  if (!req.isAuthenticated())
    return next();
  res.redirect('/');
}
