var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

// auth packages
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var app = express();

require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session store options 
var options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

var sessionStore = new MySQLStore(options);

// auth packages 
app.use(session({ // creates a session var 
  secret: 'kjksfksfsk', // random string 
  resave: false, // only saves session when changes are made in backend 
  store: sessionStore,
  saveUninitialized: false // only for logged in, not visited 
  // cookie: { secure: true } for https 
}));
app.use(passport.initialize());
app.use(passport.session());

// for use in the ejs nav button (??) 
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
}); 

// routes
var index = require('./routes/index');
var users = require('./routes/users');
app.use('/', index);
app.use('/users', users);

passport.use(new LocalStrategy(
  function (username, password, done) {
    console.log(username);
    console.log(password);

    const db = require('./db');
    db.query('SELECT id, password from user where username = ?', [username], function (err, results, fields) {
      if (err) { // if mysql error 
        done(err)
      }; // mysql error 
      if (results.length === 0) { // if no lines returned
        done(null, false);
      } else {
        const hash = results[0].password.toString(); // get hashed pword as a string 
        bcrypt.compare(password, hash, function (err, response) {
          if (response === true) {
            return done(null, {
              user_id: results[0].id
            });
          } else {
            return done(null, false)
          }
        });
      }
    })
  }
));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  console.log(err)
});

module.exports = app;