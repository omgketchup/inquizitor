/* create.js */
var app = angular.module('app', []);

app.factory('Data', function($http){
	return "I'm data, bro!";
});

app.directive('ngConfirmClick', [
	function(){
		return {
			link: function(scope, element, attr){
				var msg = attr.ngConfirmClick || "Are you sure?";
				var clickAction = attr.confirmedClick;
				element.bind('click', function(event){
					if(window.confirm(msg)){
						scope.$eval(clickAction);
					}
				})
			}
		}
	}]);

function loginPageController($scope, $http){
	console.log("Whaaaat");
	$scope.user = {email:''};
	$scope.newuser = {};
	$scope.errorMessage = "";
	$http.get('/user')
	.success(function(response){
		if(response.status == 'success'){
			console.log("Got /user " + response.user.email);
			$scope.user = response.user;
		}else{
			console.log("Not logged in.");
		}
	})
	.error(function(response){
		console.log("Error getting /user ");
	});
	$scope.LogIn = function(){
		console.log("Attempting to log in user: " + $scope.newuser.username);
		var newuser = $scope.newuser;
		$http.post('/login', newuser)
		.success(function(response){
			if(response.status == 'success'){
				console.log("Got success response from POST /login");
				window.location = "/feed";
			}else{
				$scope.errorMessage = "Invalid username or password";
				//console.log("GODDAMMIT ");
				//console.debug(response);
				//$scope.errorMessage = response.message;
			}
		})
		.error(function(response){
			$scope.errorMessage = response + " username/password combination";
		});
	};
}

function signupPageController($scope, $http){
	$scope.user = {};
	$scope.errorMessage = "";
	console.log("SIGNUP PAGE");
	$http.get('/user')
	.success(function(response){
		if(response.status = 'success'){
			console.log("Got /user " + response.user.email);
			$scope.user = response.user;
		}else{
			console.log("Sort of got /user, but... ");
		}
	})
	.error(function(response){
		console.log("Error getting /user");
	});

	$scope.SignUp = function(){
		console.debug(data);
		console.log("Angular created data from scope user");
		/*
		var data = $scope.newuser;
		console.log("user:" + $scope.newuser.email + ", " + $scope.newuser.pass);
		
		$http.post('/signup', data)
		.success(function(response){
			//alert("SUCCESS WAS:" + response.status);
			console.log("/signup SUCCESS");
			console.debug(response);
			if(response.status == "failure"){
				$scope.errorMessage = response.message;
			}
		})
		.error(function(response){
			///alert("ERROR WAS:" + response.status);
			console.log("/signup ERROR");
			console.debug(response);
		});*/
	};
}



function listQuizController($scope, $http){
	$scope.quizzes = [];
	$scope.user = {email:''}
	$scope.errorMessage = '';
	$http.get('/user')
	.success(function(response){
		if(response.status == 'success'){
			console.log("Got /user " + response.user.email);
			$scope.user = response.user;
		}else{
			console.log("Not logged in.");
		}
	})
	.error(function(response){
		console.log("Error getting /user ");
	});

	$http.get('/quizzes')
	.success(function(response){
		console.log("RESPONSE COMING OUT OF LISTQUIZCONTROLLER");
		console.debug(response);
		if(response.length > 0){
			$scope.quizzes = response;
		}else{
			$scope.errorMessage = "You don't have any items here.";
		}
		
	});

	$scope.DeleteQuiz = function(q){
		console.log("About to delete quiz " + q.name);
		$http
		.delete('/quiz', {quiz:q})
		.success(function(response){
			console.log("Got success from server when deleting a quiz...");
			var index = $scope.quizzes.indexOf(q);
			$scope.quizzes.splice(index, 1);
			console.log("I think I deleted the right quiz...");
		})
		.error(function(response){
			console.log("Got an error from server when deleting a quiz...");
		});
	}

}

function createQuizController($scope, $http, $location, $anchorScroll, $window){
	var serverquiz = {};
	var r = $location.search('serverquiz');
	console.log(r);

	var a = $window.serverquiz;
	console.log("UGH" + a);

	//get current quiz, somehow....


	$scope.questions = [];
	$scope.errorMessage = "";
	$scope.questions.push({
			text:"",
			choices:[],
			answer:"None",
			showchoices:true
		});

	$scope.typeOptions = [
		{name:"Multiple Choice", value:"multiple_choice"},
		{name:"Free Response", value:"free_response"},
		{name:"Media Link", value:"media_link"},
		{name:"Media Upload", value:"media_upload"}
	];

	$scope.user = {};
	$http.get('/user')
	.success(function(response){
		if(response.status = 'success'){
			console.log("Got /user " + response.user.email);
			$scope.user = response.user;
		}else{
			console.log("Sort of got /user, but... ");
		}
	})
	.error(function(response){
		console.log("Error getting /user ");
	});



	$scope.AddQuestion = function(){
		var last = $scope.questions[$scope.questions.length - 1];
		console.debug(last);
		if(last.text != null && typeof(last.text) != 'undefined' && last.text != "Empty" && last.text != ""){
			last.showchoices = false;
		}else{
			$scope.errorMessage = "You can't do that on television!";
			return;
		}
		
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
			alert("Sorry, you can't add any more choices to that question.");
			return;
		}
		console.log("Adding a new choice to question: " + question.text);
		question.choices.push({text:""});
	}

	$scope.ToggleChoices = function(question){
		if(question.showchoices == true && question.text != ""){
			question.showchoices = !question.showchoices;
		}else{
			console.log("Nope.");
		}		
	}

	$scope.SaveQuiz = function(){
		console.log("Saving entire quiz " + $scope.quizname);
		console.debug($scope.questions);
		var quiz = {};
		quiz.name = $scope.quizname;
		quiz.questions = $scope.questions;
		if(typeof(quiz) == 'undefined' || quiz.name.length <= 0 || quiz.name == ''){
			alert("Can't do that, need a name for your quiz!");
			return;
		}

		$http.post('/quiz', quiz)
		.success(function(response){
			console.log("Quiz Test Success! Returned something: ");
			console.debug(response);
		}).error(function(response){
			console.log("Quiz Test Failure." + reponse);
		});
	}
}