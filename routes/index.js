var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Register' });
});

// make a post request to register 
router.post('/register', function(req, res, next) {
  res.render('index', { title: 'Registration Complete' });
});


module.exports = router;
