
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , flash = require('connect-flash')
  , passport = require('passport');

var app = module.exports = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var auth = function(req, res, next){
	
};

/* PASSPORT BULLSHIT MOVE TO ANOTHERFILE EVENTUALLY */

	var LocalStrategy = require('passport-local').Strategy
	, User = require('./models/user.js');

	passport.use(new LocalStrategy(
	  function(username, password, done) {
	  	console.log("AUTHENTICATING...");
	    User.findOne({ email: username }, function(err, user) {
	      if (err) { return done(err); }
	      if (!user) {
	      	console.log("Username not found");
	        return done(null, false, { message: 'Incorrect username.' });
	      }
	      if (!user.password == password) {
	      	console.log("Password not found");
	        return done(null, false, { message: 'Incorrect password.' });
	      }
	      console.log("Must have authenticated, sweet");
	      return done(null, user);
	    });
	  }
	));

	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findOne(id, function (err, user) {
	    done(err, user);
	  });
	});
	  /*db.userModel.findOne({ username: username }, function(err, user) {
	    if (err) { return done(err); }
	    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
	    user.comparePassword(password, function(err, isMatch) {
	      if (err) return done(err);
	      if(isMatch) {
	        return done(null, user);
	      } else {
	        return done(null, false, { message: 'Invalid password' });
	      }
	    });
	  });*/

/* END PASSPORT */

mongoose.connect('mongodb://localhost/test');

app.get('/main', routes.main);
app.get('/app', routes.apphome);

app.get('/', routes.index);

//SIGN UP ROUTES
app.get('/signup', routes.signup);
app.post('/signup', routes.signup)

//LOG IN ROUTES
app.get('/login', routes.getlogin);
app.post('/login', passport.authenticate('local', {failureRedirect:'/login', failureFlash: true}), routes.apphome);

//LOG OUT ROUTES
app.get('/logout', routes.logout);
app.post('/logout', routes.logout);

//CURRENT USER
app.get('/user', routes.currentuser);

//OTHER ROUTES
app.get('/create', routes.create);

app.get('/quiz', routes.getquiz);
app.post('/quiz', routes.postquiz);
app.delete('/quiz', routes.deletequiz);

app.get('/feed', routes.feed);

app.get('/list', routes.list);
app.get('/quizzes', routes.getquizzes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
