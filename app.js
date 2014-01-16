
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , check = require('express-validator')
  , mongoose = require('mongoose')
  , flash = require('connect-flash')
  , passport = require('passport');

var app = module.exports = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({
	keepExtensions: true,
	uploadDir: __dirname + '/uploads'
}));
app.use(check());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);
console.log("After router");


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
	    User.findOne({ email: username }, function(err, user) {
	      if (err) { return done(err); }
	      console.log("Authorizing...");
	      if (!user) {
	      	console.log("Username not found");
	        return done(null, false, { message: 'Incorrect username.' });
	      }
	      if (user.pass != password) {
	      	console.log("Password not found");
	        return done(null, false, { message: 'Incorrect password.' });
	      }
	      console.log("Must have authenticated, sweet - " + user.email);
	      console.dir(user);
	      return done(null, user);
	    });
	  }
	));

	passport.serializeUser(function(user, done) {
		//console.log("Serializing user.");
		//console.dir(user);
	 	done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		//console.log("Deserializing user, about to findOne: " + id);
		//console.dir(id);
	  User.findOne({_id:id}, function (err, user) {
	  	//console.log("foundOne, " + user);
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
app.get('/', routes.takequiz);
app.get('/home', routes.index);

//SIGN UP ROUTES
app.get('/signup', routes.signup);
app.post('/signup', routes.signup)

//LOG IN ROUTES
app.get('/login', routes.getlogin);
app.post('/login', routes.postlogin);

//LOG OUT ROUTES
app.get('/logout', routes.logout);
app.post('/logout', routes.logout);

//CURRENT USER
app.get('/user', routes.currentuser);

//PUBLIC ACTION PAGES
app.get('/take', routes.takebadquiz);
app.get('/take/:id', routes.takequiz);
app.get('/results', routes.getresults);
app.get('/results/:id', routes.getresults);
app.get('/results/:id/:email', routes.getresults);


//OTHER ROUTES
app.get('/create', routes.create);

app.post('/upload', routes.uploadimage);

app.get('/view', routes.viewquiz);
app.get('/view/:id', routes.viewquiz);
app.get('/response', routes.getresponse);
app.post('/response', routes.postresponse);
app.get('/responses', routes.getresponses); //For getting all of the responses to one quiz.
app.get('/quiz', routes.getquiz);
app.post('/quiz', routes.postquiz);
app.delete('/quiz', routes.deletequiz);
app.post('/copyquiz', routes.copyquiz);

app.get('/feed', routes.feed);

app.get('/list', routes.list);
app.get('/quizzes', routes.getquizzes);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
