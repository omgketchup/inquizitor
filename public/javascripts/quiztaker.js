/*
 *
 * QUIZTAKER.JS is the end-user-facing front end application that loads the correct test, displays it, and sends the answers back to the server.
 * INQUIZITOR.JS is the back-end application that handles authenticated users creating and modifying tests or whatever.  
 *
*/

var app = angular.module('app', [ 'ngAnimate','ui.router'
	])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){
		$urlRouterProvider.otherwise('/take');
		$locationProvider.html5Mode(true);
		$stateProvider
		.state('view', {
			url:'/take',
			templateUrl:'javascripts/templates/view.html',
			controller:'TakeCtrl'
		})
		.state('view-quiz', {
			url:'/take/:id',
			templateUrl:'../javascripts/templates/view.html',
			controller:'TakeCtrl'
		})
		.state('results', {
			url:'/results',
			templateUrl:'../javascripts/templates/results.html',
			controller:'ResultsCtrl'
		})
		.state('results-quiz', {
			url:'/results/:id',
			templateUrl:'../javascripts/templates/results.html',
			controller:'ResultsCtrl'
		})
		.state('results-quiz-email', {
			url:'/results/:id/:email',
			templateUrl:'../../javascripts/templates/results.html',
			controller:'ResultsCtrl'
		})
	})
	.controller('TakeCtrl', function($scope, $http, $stateParams, $state){
		console.log("Using the TakeCtrl");
		var id = $stateParams.id;
		console.log("About to view a quiz with the _id: " + id);
		console.debug($stateParams);
		$scope.submitClass = '';
		$http({
			url: '/view',
			method: 'GET',
			params: {id:id}
		})
		.success(function(response){
			console.log("GOT ME A QUIZ BACK FROM /quiz/" + id);
			if(response.status == 'success'){
				console.log("Successfulllllly!");
				$scope.quiz = response.data;
			}else{
				console.log("Shhh, don't tell anyone I suck at this...");
				$scope.errorMessage = response.message;
			}
			console.dir(response);
		})
		.error(function(response){
			console.log("GET ME A ERROR BACK FROM /quiz/" + id);
			console.dir(response);
			$scope.errorMessage = response.message;
		});

		$scope.Debug = function(o){
			console.log("DEBUG");
			console.debug(o);
			console.log("END DEBUG");
		}

		$scope.SubmitResponse = function(){
			console.log("About to submit the responses to this quiz.  Maybe validate first?");
			$scope.submitClass = 'disabled';
			var q = $scope.quiz;
			var submission = {email: $scope.email, responseTo: $scope.quiz._id};
			var answers = [];
			for(var i = 0; i<q.questions.length; i++){
				var question = q.questions[i];
				var response = {};

				response.text = question.text;
				response.response = question.response;

				if(question.type == 'multiple_choice'){
					response.response = question.response.text;
					if(typeof(response.response) == 'undefined'){
						response.response = question.response;
						//response.response = question.response.value;
					}
				}
				answers.push(response);
			}
			submission.answers = answers;
			console.debug(submission);
			console.log("Compiled the list of responses, there were " + answers.length);
			$http({
				url:"/response",
				method:"POST",
				data:submission
			})
			.success(function(response){
				$scope.submitClass = '';
				console.log("SUCCESSFULLY SUBMITTED A RESPONSE TO THE QUIZ BY THE GUY: " + $scope.email);
				if($scope.quiz.advancedOptions.resultType == 'poll'){
					console.log("Should redirect to the poll results view");
					$state.go('results-quiz-email', {id: q._id, email:$scope.email});
				}else if($scope.quiz.advancedOptions.resultType == 'self'){
					console.log("Should redirect to the self results view");
					$state.go('results-quiz-email', {id: q._id, email:$scope.email});
				}else{
					console.log("Should redirect to the general results view");
					//console.log($scope.email);
					$state.go('results-quiz-email', {id: q._id, email:$scope.email});
				}
			})
			.error(function(response){
				console.log("ERROR COMING BACK FROM SERVER...");
				$scope.submitClass = '';
			});
		}

		$scope.TakeMeHome = function(){
			window.location = '/';
		}
	})
	.controller('ResultsCtrl', function($scope, $http, $state, $stateParams){
		console.log("USING THE RESULTS CONTROLLER");
		console.debug($stateParams);

		$scope.GetResults = function(){
			console.log("About to look up results.");
			if($scope.email == '' || $scope.email == null){
				console.log("Email address no good!");
				return;
			}
			$http({
				url: '/response',
				method: 'GET',
				params: {id: $stateParams.id, email: $scope.email}
			})
			.success(function(response){
				console.log("Successful response when looking up results");
				if(response.status == 'success'){
					console.log("WOO WOO");
					$scope.quiz = response.data.quiz;
					$scope.responses = response.data.responses;
				}else{
					console.log("App said aww hell naw: " + response.message);
				}
			})
			.error(function(response){
				console.log("Error response when looking up results");
			});
		}

		//Auto-load the responder's response, if there is one...
		if($stateParams.email != '' && $stateParams.email != null){
			//email is good...
			if($stateParams.id != '' && $stateParams.id != null && $stateParams.id != 0){
				//id is probably good...
				$http({
					url: '/response',
					method: 'GET',
					params: {id: $stateParams.id, email: $stateParams.email}
				})
				.success(function(response){
					console.log("Successful response when looking up results");
					if(response.status == 'success'){
						console.log("WOO WOO");
						$scope.quiz = response.data.quiz;
						$scope.responses = response.data.responses;
					}else{
						console.log("App said aww hell naw: " + response.message);
					}
				})
				.error(function(response){
					console.log("Error response when looking up results");
				});
			}else{
				console.log("Invalid quiz ID to auto-load");
			}
		}else{
			console.log("Invalid email address to auto-load");
		}
	})
;