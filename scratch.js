passport.use(new LocalStrategy(
    function (username, password, done) {
  
      const db = require('./db');
      db.query('SELECT password from user where username = ?', 
      [username], function (err, results, fields) {
        if(err) {done(err)}; // mysql error 
        if(results.length === 0) done(null, false); // if no hits 
  
        const hash = results[0].password.toString();
        bcrypt.compare(password, hash, function(err, response){
          if(response === true) {
            return done(null, {user_id: results[0].id});
          } else {
            return done(null, false)
          }
        });
      })
    }
  ));

  
/* Some handlebars nonsense
// Handlebars default config
const hbs = require('hbs');
const fs = require('fs');

const partialsDir = __dirname + '/views/partials';

const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});
*/