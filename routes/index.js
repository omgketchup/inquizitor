
var SweetQuiz = require('../models/quiz.js');
var User = require('../models/user.js');
var passport = require('passport');

var ObjectId = require('mongoose').Types.ObjectId; 

exports.main = function(req, res){
	res.render('templates/main');
}
exports.apphome = function(req, res){
	if(req.isAuthenticated()){
		res.render('templates/app');
	}else{
		res.redirect('/login');
	}
	
}









/* FUCK EVERYTHING BELOW THIS */

exports.index = function(req, res){
	res.render('index', { title: 'Inquizitor App Home' });
};
exports.getlogin = function(req, res){
	res.render('login', {message:req.flash('error')});
};
exports.postlogin = function(req, res){
	if(req.isAuthenticated()){
		res.send({status:"success", user: req.user});
	}else{
		res.send({status:"failure", message:"Invalid username/password combination."});
	}
	
};
exports.logout = function(req, res){
	req.logout();
	res.redirect('/');
};

exports.currentuser = function(req, res){
	if(req.isAuthenticated()){
		res.send({status:"success", user: req.user});
	}else{
		res.send({status:"failure"});
	}
}

exports.signup = function(req, res){
	if(req.method == "POST"){
		//create a user
		console.log("About to search for: ");
		console.dir(req.body);
		User.findOne({email: req.body.email}, function(err, user){
			if(err){ console.log("LOGGING MONGODB ERROR while checking to see if we can create a new user: " + err)}
			if(user == null){
				//user is allowed to be created, so save that motherfucker.
				var newuser = new User(req.body);
				newuser.save(function(err, newuser){
					if(err){ console.log("LOGGING MONGODB ERROR while saving a new user: " + err)}
					console.log("Just saved newuser: " + newuser.email);
				});
			}else{
				//user was already found in the system.
				res.send({status:"failure", message:"That email address already exists in our system"});
			}
		});
	}else if(req.method == "GET"){
		//display form
		res.render('signup', req.body.data);
	}
}

exports.postquiz = function(req, res){ //async
	console.log("Posting to quiz");
	if(req.isAuthenticated()){

		var quiz = new SweetQuiz(req.body.quiz);
		quiz.author = req.user.email;
		if(typeof(quiz.created) == 'undefined'){
			console.log("No created on quiz..., setting it to now");
			quiz.created = Date.now();
		}
		console.log("About to look for and update quiz: " + quiz._id);
		SweetQuiz.update(
			{
				_id: quiz._id,
				author: quiz.author
			},
			{
				$set:{
					name:quiz.name,
					questions:quiz.questions,
					created:quiz.created,
					author:quiz.author
				}
			},
			{
				upsert: true
			},
			function(err, fin, details, extra){
				console.log("Finish Upsert Handler");
				if(err){ 
					console.log("Error.");
					res.send({status:"failure", message:"Couldn't update that quiz. " + err}); 
				}else{
					console.log("Success");
					console.dir(details);
					if(details.updatedExisting == true){
						console.log("Updated existing document: " + quiz._id);
					}else{
						console.log("Created new document: " + details.upserted);
					}
					res.send({
						status:'success', 
						data: {id: details.upserted, updatedExisting: details.updatedExisting}, 
						message:"ID of the newly created document is included in data.id of this response."
					});
				}
			}
		);
	}else{
		res.send({status:"failure", message: "User was not authenticated"});
	}
	
	
}
exports.getquiz = function(req, res){ //async
	console.log("GETTING QUIZ: " + req.query.id + ", " + req.user.email);
	SweetQuiz.findOne(
		{_id: new ObjectId(req.query.id), author:req.user.email}, 
		function(err, q){
			if(err){ 
				console.log("ERROR WAS " + err); 
			}
			if(q != null){
				console.log("QUIZ: " + q.name);
				res.send({status:"success", message:"Got that quiz, what an accomplishment!", quiz:q});
			}else{
				console.log("QUIZ IS NULL");
				res.send({status:"failure", message:"No quizzes matched that query."});
			}
		}
	);

}
exports.deletequiz = function(req, res){ //async
	console.log("Deleting quiz: " + req.body.quiz);
	if(req.isAuthenticated()){
		console.log("Is the quiz authored by the requester? " + req.user.email);
		SweetQuiz.findOne(req.body.quiz, function(err, quiz){
			console.log("Finished FindOne for a quiz" + quiz);
			quiz.remove(function(err, quiz){
				res.send({status:"success", message:"Deleted quiz."});
			});
		});
	}else{
		res.send({status:"failure", message:"Not authorized to delete that quiz."});
	}
}

exports.getquizzes = function(req, res){
	if(req.isAuthenticated()){
		SweetQuiz.find(function(err, quizzes){
			if(err) res.send("No quizzes found, something's screwy.");
			console.log("Found " + quizzes.length + " quizzes.");
			res.send({quizzes:quizzes, status:'success', message:'got quizzes!'});
		});
	}else{
		res.send({status:"failure", message:"You must be logged in to do that.", code: '401'});
	}
}

exports.feed = function(req, res){
	if(req.isAuthenticated()){
		console.log("WAS AUTHENTICATED");
		SweetQuiz.find(function(err, quizzes){
			if(err) res.send("No quizzes found, something's screwy.");
			console.log("Found " + quizzes.length + " quizzes.");
			res.render('list', {quizzes:quizzes});
		});
	}else{
		console.log("WAS NOT AUTHENTICATED");
		res.redirect('/login');
		//res.send({status:"failure", message:"You must be logged in to do that."});
	}
}
exports.getguizzes = function(req, res){
	if(req.isAuthenticated()){
		SweetQuiz.find(function(err, quizzes){
			if(err) res.send("No quizzes found, something's screwy.");
			console.log("Found " + quizzes.length + " quizzes.");
			res.send(quizzes);
		});
	}else{
		res.send({status:"failure", message:"You must be logged in to do that."});
	}
}




/*
 * GET create page.
 */
exports.create = function(req, res){
	console.log("HIT CREATE");
	if(req.isAuthenticated()){
		console.log("User is authenticated, allow access to /create page");
		res.render('create', { title: 'Create a new quiz', user: req.user, serverquiz:{name:"SERVER QUIZ"} });
	}else{
		res.redirect("/login", {message: "You need to be logged in to do that!"});
	}
};

exports.quiztest = function(req, res){
	console.log("THE REQUEST HAS: ");
	console.dir(req.body);
	var newQuiz = req.body;
	var saveable = new SweetQuiz(newQuiz);
	console.log("Saveable " + saveable.name);
	console.dir(saveable);
	saveable.save(function(err, saveable){
		console.log("Holy shit did it work");
		SweetQuiz.find(function(err, quizzes){
			if(err) res.send("No quizzes found, something's screwy.");
			console.log("Found " + quizzes.length + " quizzes.");
			res.send(quizzes);
		})
	});
};

exports.browse = function(req, res){
	res.render('list');
}

exports.list = function(req, res){
	res.render('list');
}

exports.quizzes = function(req, res){
	SweetQuiz.find(function(err, quizzes){
		res.send(quizzes);
	});
}

/*
exports.login = function(req, res, info){
	console.log("Hit login. " + req.method + " flash: " + req.flash('error'));
	if(req.method == "POST"){
		console.log("Must have passed authentication... " + req.flash('error'));
		res.send({status:"success"});
	}else if(req.method == "GET"){
		res.render('login', {message: req.flash('error')});
	}else{
		res.send("Don't know what to do with this method.");
	}
}
*/

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

exports.mongoosetest = function(req, res){
	var body = "Mongoose.<br/>"

	var mongoose = require('mongoose');
	mongoose.models = {}
	mongoose.modelSchemas = {}

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function () {
		// yay!
		console.log("Opened connection.");
		var kittySchema = mongoose.Schema({
		    name: String
		});

		var Kitten = mongoose.model('Kitten', kittySchema);

		var kitty = new Kitten({name:"KittyKitty"});

		console.log("Created a kitty " + kitty.name);

		kitty.save(function(err, kitty){
			if(err){}
			console.log("SAVED the kitty " + kitty.name);

			console.log("Going to look for ALL the kitties");
			Kitten.find(function(err, kittens){
				console.log("Kittens: " + kittens);
				res.send(kittens);
			});
		});
	});

	

	mongoose.disconnect();
	mongoose.connect('mongodb://localhost/test');

	//res.send("Done");

}