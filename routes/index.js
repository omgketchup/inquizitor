
var SweetQuiz = require('../models/quiz.js');
var QuizResponse = require('../models/quiz_response.js');
var User = require('../models/user.js');
var passport = require('passport');
var check = require('express-validator');

var ObjectId = require('mongoose').Types.ObjectId; 

exports.main = function(req, res){
	res.render('templates/main');
}
exports.apphome = function(req, res){
	if(req.isAuthenticated()){
		res.render('templates/app');
	}else{
		res.render('login', {status:'failure', message:'Sorry, something didnt work out there'});
	}
}



/* FUCK EVERYTHING BELOW THIS */

exports.index = function(req, res){
	res.render('index', { title: 'Inquizitor App Home' });
};
exports.getlogin = function(req, res){
	console.log("Got login...?");
	req.logout();
	if(req.isAuthenticated()){
		res.redirect('/app');
	}else{
		res.render('login', {message:req.flash('error'), status:'nothing'});
	}
};
exports.postlogin = function(req, res, next){
	
	console.log("Posting login.");
	console.dir(req.user);

        passport.authenticate('local', function(err, user) {
            if (err) { return next(err) }
            if (!user) {
                //res.local("username", req.param('username'));
                return res.render('login', { status: 'failure', message: "Invalid username/password combination." });
            }
            console.log("About to do a 'login'");
            // make passportjs setup the user object, serialize the user, ...
            req.login(user, {}, function(err) {
                if (err) { 
                	return next(err); 
                }else{
                	console.log("Redirecting to /app");
                	return res.redirect("/app");
                }
            });
        })(req, res, next);
        return;
    

};
exports.logout = function(req, res){
	console.log("LOGGING OUT!")
	req.logout();
	console.dir(req.user);
	res.redirect('/');
};

exports.currentuser = function(req, res){
	if(req.isAuthenticated()){
		console.log("Getting current user, it's: " + req.user.email);
		res.send({status:"success", user: req.user});
	}else{
		res.send({status:"failure"});
	}
}

exports.signup = function(req, res){
	if(req.method == "POST"){
		//create a user
		req.checkBody('email', 'Invalid email').notEmpty().isEmail();
		req.checkBody('pass', 'Invalid password').len(5,25);
		var valErrors = req.validationErrors();
		if(valErrors){
			console.dir(valErrors);
			res.render('signup', {status:"failure", message:"Invalid email address or password " + valErrors, css:"alert"});
			return;
		}


		User.findOne({email: req.body.email}, function(err, user){
			if(err){ console.log("LOGGING MONGODB ERROR while checking to see if we can create a new user: " + err)}
			if(user == null){
				//user is allowed to be created, so save that motherfucker.
				var newuser = new User(req.body);
				newuser.save(function(err, newuser){
					if(err){ console.log("LOGGING MONGODB ERROR while saving a new user: " + err)}
					console.log("Just saved newuser: " + newuser.email);
					//res.redirect('/app');
					res.render('login', {status:"success", message:"Thanks for signing up!", css:"success"})
				});
			}else{
				//user was already found in the system.
				res.render('signup', {status:"failure", message:"That email address already exists in our system", css:"alert"})
			}
		});
	}else if(req.method == "GET"){
		//display form
		res.render('signup', {status:'nothing'});
	}
}

exports.postquiz = function(req, res){ //async
	console.log("Posting to quiz");
	if(req.isAuthenticated()){

		var quiz = new SweetQuiz(req.body.quiz);
		console.log("QUIZ ADVANCED OPTIONS:");
		console.dir(quiz);
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
					type:quiz.type,
					advancedOptions: quiz.advancedOptions,
					questions:quiz.questions,
					created:quiz.created,
					author:quiz.author, 
					description: quiz.description,
					thankyou: quiz.thankyou
				}
			},
			{
				upsert: true
			},
			function(err, fin, details, extra){
				console.log("Finish Upsert Handler");
				if(err){ 
					console.log("Error. " + err);
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
				console.log("QUIZ: " + q.name + ", type: " + q.type);

				if(req.isAuthenticated()){
					if(req.user.email == q.author){
						console.log("This is that user, you can append the responses or something...");
						QuizResponse.find(
							{
								responseTo: req.query.id, 
								responder: req.query.email
							}, 
							function(err, foundResponses){
								if(err){ 
									console.log("Error looking up responses to quiz...");
									res.send({status:"success", message:"Got that quiz, what an accomplishment!", quiz:q});
									return;
								}else{
									console.log("GODDAMMIT");
									console.dir(foundResponses);
									if(foundResponses != null && typeof(foundResponses) != 'undefined' && foundResponses.length != 0){
										console.dir(foundResponses);
										if(foundResponses.length == 0){
											if(foundResponses.text != '' && typeof(foundResponses.text) != 'undefined'){
												q.numba = 1;
											}else{
												q.numba = 0;
											}
										}else{
											console.log("Q numba wont be 0");
											q.numba = foundResponses.length;
										}
										if(q.numba > 0){  // FIGURE OUT PERCENTAGE HERE, MAYBE
											if(q.type == 'poll' || q.type == 'Poll'){
												for(var i = 0; i<q.questions.length; i++){
													var ques = q.questions[i];
													var answ = foundResponses[i];
													//console.debug("Question: " + ques.text + ", answer: " + answ.response);
												}
											}
											
										}
										console.log("Q NUMBA IS: " + q.numba);
										res.send({status:"success", message:"Got that quiz, what an accomplishment! " + q.numba, quiz:q});
									}else{
										console.log("FoundResponses was null or something..." + foundResponses);
										res.send({status:'success', message:"Got it", quiz:q});
									}
								}
							}
						);
					}else{
						console.send({status:"success", message:"Got quiz, no responses or anything", quiz:q});
					}
				}else{
					//STRIP isCorrect FLAGS FROM HERE!
					console.send({status:"success", message:"Got quiz, no responses or anything", quiz:q});
				}
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
		console.dir(req.query);
		
		SweetQuiz.findOne({_id: new ObjectId(req.query._id)}, function(err, quiz){
			console.log("Finished FindOne for a quiz" + quiz);
			if(err){ 
				console.log("ERROR DELETING QUIZ... " + err); 
				res.send({status:'failure', message:'Error deleting quiz ' + err});
				return;
			}
			else{
				quiz.remove(function(err, quiz){
					console.log("Removed!");
					res.send({status:"success", message:"Deleted quiz."});
				});
			}
		});
	}else{
		res.send({status:"failure", message:"Not authorized to delete that quiz."});
	}
}
exports.viewquiz = function(req, res){
	//console.log("Getting a quiz for viewing... " + req.query.id);
	console.dir(req.query);
	console.dir(req.params);
	try{
		var oid = new ObjectId(req.query.id.toString());
	}catch(err){
		//console.log("Caught error creating new object id... failed lookup");
		try{
			var oid = new ObjectId(req.params.id);
		}catch(err){
			res.send({status:'failure', message:'Invalid quiz ID. ' + err});
			return;
		}
	}
	SweetQuiz.findOne({_id: oid}, function(err, quiz){
		if(err){ console.log("Error looking up quiz for viewing... " + err); return; }
		//console.log("Finished FindOne for a quiz" + quiz);
		if(quiz!=null){
			//console.log("SUCCESS!");
			res.send({status:'success', data:quiz, message:'Got a quiz for viewing, no answer info...'});
		}else{
			//console.log("Failure :-( ");
			res.send({status:'failure', message:'No quiz matching that ID was found. '});
		}
		
	});
}

exports.postresponse = function(req, res){
	var response = req.body;
	QuizResponse.update(
		{
			responseTo: response.responseTo,
			email:response.email
		},
		{$set:{
			responseTo: response.responseTo,
			email: response.email,
			answers: response.answers,
			submitted: Date.now()
		}},
		{upsert:true},
		function(err, fin, details){
			if(err){
				res.send({status:'failure', message: "Got error: " + err}); 
			}else{
				console.log("Successfully upserted a response...");
				console.dir(response);
				console.log("-----------------------------------------");
				console.dir(details);
				res.send({status:'success'});
			}
		}
	);
}
exports.getresponses = function(req, res){
	//you must be authenticated
	//you must be the author of the quiz
	var id = req.query.id;
	if(req.isAuthenticated()){
		//console.log("User is authenticated.");
		SweetQuiz.findOne({_id: id}, function(err, foundQuiz){
			if(err){ 
				//console.log("Could not find a quiz that matched that ID while making sure the current user is that quiz's author."); 
				res.send({status:'failure', message: 'Sorry, could not find a quiz to match that ID.'});
				return; 
			}
			else{
				if(foundQuiz != null){
					if(foundQuiz.author == req.user.email){
						//console.log("The current user is the author of this!  Now we can try to find all the responses to this quiz.");

						QuizResponse.find(
							{
								responseTo: foundQuiz._id
							}, 
							function(err, foundResponses){
								if(err){ console.log("Looked up responses to the legit quiz, but got an error: " + err); return; }
								if(foundResponses != null){

									//CALCULATE PERCENTAGES FOR MULTIPLE CHOICE QUIZ RESULTS WITH ANSWERS
									if(foundQuiz.type == 'poll' || foundQuiz.type == 'Poll'){
										for(var q = 0; q<foundResponses.length; q++){
											var oneResponse = foundResponses[q];
											var numCorrect = 0;
											for(var i = 0; i<foundQuiz.questions.length; i++){
												var question = foundQuiz.questions[i];
												var rightAnswer;
												for(var n = 0; n<question.choices.length; n++){
													var yeaman = question.choices[n];
													if(yeaman.isCorrect){
														console.log("CORRECT ANSWER IS " + yeaman.text);
														rightAnswer = yeaman;
													}
												}
												var answer = oneResponse.answers[i];

												var correct = false;
												console.log("RightAnswer: " + rightAnswer);
												if(typeof(rightAnswer) != 'undefined' && answer.response == rightAnswer.text){
													correct = true;
													numCorrect++;
												}
												console.log("Q/A combo: " + question.text + "/" + answer.response + " / " + correct);
											}
											var percentage = numCorrect / foundQuiz.questions.length;
											oneResponse.percentage = percentage;
											console.log("ONE RESPONSE: ");
											console.dir(oneResponse);
										}
									}
									


									//console.log("FoundResponses was not null, sweet! " + foundResponses.length);
									res.send({status:'success', data:{responses:foundResponses, quiz:foundQuiz}});
								}else{
									//console.log("FoundResponses is null, what the hell guy do better code stuff");
									res.send({status:'failure', message:"Sorry, no responses found for that."});
								}
							}
						);

					}else{
						//console.log("The current user is NOT the author!  How did this even happen?");
						res.send({status:'failure', message:"Sorry, but you're not allowed to see those responses."});
					}
				}else{
					//console.log("FoundQuiz was null you did something wrong!");
					res.send({status:'failure', message:"Sorry, that doesn't seem to be a valid thing to ask for."});
				}
			}
		})
	}else{
		res.send({status:'failure', message:"Sorry, you need to be logged in to do that."});
	}
}

exports.getresults = function(req, res){	
	res.render('templates/front');
}

exports.getresponse = function(req, res){
	console.log("Looking for a response with id: " + req.query.id);
	QuizResponse.findOne(
		{email: req.query.email, responseTo: req.query.id},
		function(err, foundResponse){
			if(err){ 
				res.send({status:'failure', message:'Couldnt find. ' + err});
				return;
			}
			else{
				if(foundResponse == null || !foundResponse || typeof(foundResponse) == 'undefined'){
					console.log("It was null or something...");
					res.send({status:'failure', message:'foundResponse was null'});
					return;
				}
				SweetQuiz.findOne({_id: foundResponse.responseTo}, function(err, foundQuiz){
					if(err){ 
						res.send({status:'failure', message:'no quiz found for this response'}); 
						return;
					}
					else{
						if(!foundQuiz){
							res.send({status:'failure', message:'foundQuiz was null'});
							return;
						}
						res.send({status:'success', data: {quiz: foundQuiz, responses: foundResponse}});
					}
				});
			}
		}
	);
}


exports.getquizzes = function(req, res){
	if(req.isAuthenticated()){
		SweetQuiz.find({author:req.user.email}, function(err, quizzes){
			if(err) res.send("No quizzes found, something's screwy.");
			console.log("Found " + quizzes.length + " quizzes.");
			res.send({quizzes:quizzes, status:'success', message:'got quizzes!'});
		});
	}else{
		res.send({status:"failure", message:"You must be logged in to do that.", code: '401'});
	}
}


exports.takequiz = function(req, res){
	console.dir(req.params);
	res.render('templates/front');
}








//FUCK EVERYTHING BELOW HERE

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
		res.redirect('/login', {status:'failure', message:'You must be logged in to do that.'});
		//res.send({status:"failure", message:"You must be logged in to do that."});
	}
}
/*exports.getguizzes = function(req, res){
	if(req.isAuthenticated()){
		SweetQuiz.find(function(err, quizzes){
			if(err) res.send("No quizzes found, something's screwy.");
			console.log("Found " + quizzes.length + " quizzes.");
			res.send(quizzes);
		});
	}else{
		res.send({status:"failure", message:"You must be logged in to do that."});
	}
}*/




/*
 * GET create page.
 */
exports.create = function(req, res){
	console.log("HIT CREATE");
	if(req.isAuthenticated()){
		console.log("User is authenticated, allow access to /create page");
		res.render('create', { title: 'Create a new quiz', user: req.user, serverquiz:{name:"SERVER QUIZ"} });
	}else{
		res.redirect("/login", {status:'failure', message:'You must be logged in to do that.'});
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


//Basic functionality...
function GetQuizByID(id){

}
function GetAllQuizzesByAuthor(author){

}
function GetAllResponsesByID(id){

}
function GetAllResponsesByResponder(responder){

}
function GetResponseToQuizByResponder(id, responder){

}