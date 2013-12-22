/* create.js */
var app = angular.module('app', []);

app.factory('Data', function(){
	return "I'm data, bro!";
})



function listQuizController($scope, $http){
	$scope.quizzes = [];
	$http.get('/quizzes')
	.success(function(response){
		console.log("RESPONSE COMING OUT OF LISTQUIZCONTROLLER");
		console.debug(response);
		$scope.quizzes = response;
	});

}

function createQuizController($scope, $http){
	$scope.questions = [];

	$scope.AddQuestion = function(){
		$scope.questions.push({
			text:"Empty",
			choices:[],
			answer:"None",
			showchoices:true
		});
		console.log("ADDING A QUESTION, there are now" + $scope.questions.length);
	};

	$scope.AddChoice = function(question){
		if(question.choices.length > 4){
			return;
		}
		console.log("Adding a new choice to question: " + question.text);
		question.choices.push({text:"New Question"});
	}

	$scope.ToggleChoices = function(question){
		question.showchoices = !question.showchoices;
	}

	$scope.SaveQuiz = function(){
		console.log("Saving entire quiz " + $scope.quizname);
		console.debug($scope.questions);
		var quiz = {}
		quiz.name = $scope.quizname;
		quiz.questions = $scope.questions;

		$http.post('/quiztest', quiz)
		.success(function(response){
			console.log("Quiz Test Success! Returned something: ");
			console.debug(response);
		}).error(function(response){
			console.log("Quiz Test Failure." + reponse);
		});

		//Check if this quiz already exists in mongodb
		//if it does, update the existing quiz
		//otherwise, save it as a new quiz.


	}
}