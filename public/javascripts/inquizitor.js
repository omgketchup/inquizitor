var app = angular.module('app', [ 'ngAnimate','ui.router'
	])
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/home');
		$stateProvider
		.state('home', {
			url:'/home',
			templateUrl:'javascripts/templates/home.html'
		})
		.state('list', {
			url:'/list',
			templateUrl: 'javascripts/templates/list.html',
			controller: 'ListCtrl'
		})
		.state('new', {
			url:'/edit',
			templateUrl: 'javascripts/templates/edit.html',
			controller: 'EditCtrl'
		})
		.state('edit', {
			url:'/edit/:id',
			templateUrl: 'javascripts/templates/edit.html',
			controller: 'EditCtrl'
		})
	})
	.controller('MainCtrl', function($scope, $http){
		console.log("Using the MainCtrl");
		$http({
			url: '/user',
			method: 'GET'
		})
		.success(function(response){
			console.log("GOT CURRENT USER");
			$scope.user = response.user;
		})
		.error(function(response){

		});
	})
	.controller('ListCtrl', function($scope, $http){
		console.log("Using ListCtrl");
		var quizzes = [];

		/* GET ALL MY QUIZZES ON INIT */
		$http.get('/quizzes')
		.success(function(response){
			if(response.status == 'success'){
				$scope.quizzes = response.quizzes;
			}else{
				if(response.code == '401'){
					this.window.location = '/';
				}
				console.log("Didn't get any quizzes..." + response.message);
			}
		})
		.error(function(response){
			console.log("Some kind of error... " + response);
		});
	})
	.controller('EditCtrl', function($scope, $http, $stateParams){
		$scope.quiz = {};
		$scope.typeOptions = [
			{name:"Multiple Choice", value:"multiple_choice"},
			{name:"Free Response", value:"free_response"},
			{name:"Media Link", value:"media_link"},
			{name:"Media Upload", value:"media_upload"}
		];

		if($stateParams.id != null && $stateParams.id != '' && $stateParams.id != 0){
			//Populate $scope.quiz with the existing quiz on the server
			var n = $stateParams.id;
			console.log("StateParam name: " + n);
			$http({
				url: '/quiz',
				method: 'GET',
				params: {id: n}
			})
			.success(function(response){
				console.log("Got a successful http response from /quiz");
				if(response.status == 'success'){
					$scope.quiz = response.quiz;
					console.debug($scope.quiz);
				}else{
					console.log("Failure from /quiz.");
				}
			});
		}else{
			//Populate $scope.quiz with a brand new quiz.
			$scope.quiz = {};
		}

		$scope.ToggleChoices = function(question){
			question.showchoices = !question.showchoices;
		}


		$scope.AddQuestion = function(){
			if($scope.quiz.name == '' || typeof($scope.quiz.name) == 'undefined'){
				return;
			}
			var newQuestion = {choices:[{text:''}], showchoices:true, type:'free_response'};
			if(typeof($scope.quiz.questions) == 'undefined'){
				$scope.quiz.questions = [];
			}
			$scope.quiz.questions.push(newQuestion);
		}
		$scope.CopyQuestion = function(question){
			console.log("Copying a question...");
			var newQ = {text:question.text, type: question.type, choices: question.choices};
			//newQ = question;

			$scope.quiz.questions.push(newQ);
		}
		$scope.DeleteQuestion = function(question){
			$scope.quiz.questions.splice($scope.quiz.questions.indexOf(question), 1);
		}

		$scope.AddChoice = function(question){
			if(typeof(question.choices) == 'undefined' || question.choices == null){
				question.choices = [];
			}
			if(question.choices.length > 4){
				console.log("Too many options, can't add another.");
				return;
			}
			var newChoice = {text:''}
			question.choices.push(newChoice);
		}
		$scope.DeleteChoice = function(question, choice){
			console.debug(question);
			if(question.type == 'multiple_choice' && question.choices.length > 1){
				question.choices.splice(question.choices.indexOf(choice), 1);
			}else{
				console.log("Can't do that because you need at least one choice in a multiple choice question...");
			}
		}

		$scope.savingAllowed = true;

		$scope.SaveQuiz = function(){
			if($scope.savingAllowed == false){
				alert("Can't save right now!");
				return;
			}
			$scope.savingAllowed = false;
			var saveQuiz = $scope.quiz;
			console.debug(saveQuiz);
			$http.post('/quiz', {quiz:saveQuiz})
			.success(function(response){
				if(response.status == 'success'){
					console.log("Successfully saved the quiz!");
					$scope.savingAllowed = true;
					if(response.data.updatedExisting == false){
						$scope.quiz._id = response.data.id;
					}
				}else{
					console.log("Couldn't save the quiz!");
					$scope.savingAllowed = true;
				}
			})
			.error(function(response){
				console.log("RESPONSE: " + response);
				$scope.savingAllowed = true;
			});

		}

	})
;