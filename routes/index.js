
var SweetQuiz = require('../models/quiz.js');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Inquizitor App Home' });
};


/*
 * GET create page.
 */
exports.create = function(req, res){
	res.render('create', { title: 'Create a new quiz' });
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
	//res.send("Doing something async");
};

exports.list = function(req, res){
	res.render('list');
}

exports.quizzes = function(req, res){
	SweetQuiz.find(function(err, quizzes){
		res.send(quizzes);
	});
}

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