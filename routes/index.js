var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var bcrypt = require('bcrypt');
const saltRounds = 10; // amount of plaintext rds to go through, higher=slower 
var passport = require('passport');


router.get('/', function(req,res){
  console.log(req.user); // passport user 
  console.log(req.isAuthenticated()); // passport authentication 

  res.render('home', {
    title: 'Home',
    errors: undefined
  });
})

router.get('/login', function(req,res){

  res.render('login', {
    title: 'Login',
    errors: undefined
  });
})

router.get('/profile', authenticationMiddleware(), function(req, res){
  res.render('profile', {
    title: 'Profile',
    errors: undefined
  });


})

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Register',
    errors: undefined
  });
});

router.post('/register', function (req, res, next) { // make a post request to register 

  // sort these out 
  req.checkBody('username', 'Username field cannot be empty.').notEmpty();
  req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
  req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
  req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
  req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('register', {
      title: 'Registration Error',
      errors: errors
    });
  } else {
    // access individual values from form
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, function (err, hash) {
      // Store hash in your password DB.
      const db = require('../db');
      // insert user 
      db.query('insert into user (username, email, password) values(?, ?, ?)', [username, email, hash], function (error, results, fields) {
        if (error) console.log(error);
        
        db.query('SELECT LAST_INSERT_ID() as user_id', function(error, result, fields){
          if(error) console.log(error); 

          const user_id = result[0];

          console.log(result[0]);
          req.login(user_id, function(err){
            res.redirect('/')
          })
        });
      }) // end insert 
    }); // end bcrypt
  } // end else 
}); // end post 

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});
 
passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});

// boilerplate middleware 
// calls a req rers to test whether the person is authenticated 
function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}

module.exports = router;