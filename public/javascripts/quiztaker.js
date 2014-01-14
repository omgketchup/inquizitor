/*
 *
 * QUIZTAKER.JS is the end-user-facing front end application that loads the correct test, displays it, and sends the answers back to the server.
 * INQUIZITOR.JS is the back-end application that handles authenticated users creating and modifying tests or whatever.  
 *
*/

var app = angular.module('app', [ 'ngAnimate','ui.router', 'ngSanitize'
	])
	.config(function($stateProvider, $urlRouterProvider, $locationProvider){
		//console.log("Goddammit");
		$urlRouterProvider.otherwise('take');
		
		$stateProvider
		.state('takehome', {
			url:'/',
			templateUrl:'javascripts/templates/view.html',
			controller:'TakeCtrl'
		})
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

		if(window.history && window.history.pushState){
		    //console.log("HTML 5 mode is true...");
		}
		//console.log("Defined states... should pick one and use its controller...");
		$locationProvider.html5Mode(true);
	})
	.controller('TakeCtrl', function($scope, $http, $stateParams, $state){
		$scope.message = "Loading...";
		//console.log("Using the TakeCtrl");  

		window.top.postMessage("change", "*");
		//console.log("Just posted message to top");

		var id = $stateParams.id;
		if(typeof($stateParams.id) == 'undefined' || id == ''){
			$scope.message = "Sorry, we couldn't figure that one out.  Check the link and try again.";
		}else{
			//console.log("ID WAS NOT UNDEFINED!:  " + id);
		}


		$scope.submitClass = '';
		$http({
			url: '/view',
			method: 'GET',
			params: {id:id}
		})
		.success(function(response){
			//console.log("GOT ME A QUIZ BACK FROM /quiz/" + id);
			if(response.status == 'success'){
				//console.log("Successfulllllly!");
				$scope.quiz = response.data;
			}else{
				//console.log("Shhh, don't tell anyone I suck at this...");
				$scope.errorMessage = response.message;
			}
			//console.dir(response);
		})
		.error(function(response){
			//console.log("GET ME A ERROR BACK FROM /quiz/" + id);
			//console.dir(response);
			$scope.errorMessage = response.message;
		});

		$scope.validationError = '';

		$scope.Debug = function(o){
			/*console.log("DEBUG");
			console.debug(o);
			console.log("END DEBUG");*/
		}

		$scope.SubmitResponse = function(){
			if($scope.quizform){
				//console.log("Got it");
				$scope.val = 'showvalidation';
				if(!$scope.quizform.$valid){
					//console.log("QUIZ IS NOT VALID, DONT SUBMIT");
					$scope.validationError = "You're missing a required field! Make sure you enter your email, and answer all the questions.";
					return;
				}else{
					//console.log("All good");
				}
			}else{
				console.log("NO QUIZFORMY WTF");
			}

			//console.log("About to submit the responses to this quiz.  Maybe validate first?");
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
			//console.debug(submission);
			//console.log("Compiled the list of responses, there were " + answers.length);
			$http({
				url:"/response",
				method:"POST",
				data:submission
			})
			.success(function(response){
				$scope.submitClass = '';
				//console.log("SUCCESSFULLY SUBMITTED A RESPONSE TO THE QUIZ BY THE GUY: " + $scope.email);
				if($scope.quiz.advancedOptions.resultType == 'poll'){
					//console.log("Should redirect to the poll results view");
					$state.go('results-quiz-email', {id: q._id, email:$scope.email});
				}else if($scope.quiz.advancedOptions.resultType == 'self'){
					//console.log("Should redirect to the self results view");
					$state.go('results-quiz-email', {id: q._id, email:$scope.email});
				}else{
					//console.log("Should redirect to the general results view");
					//console.log($scope.email);
					$state.go('results-quiz-email', {id: q._id, email:$scope.email});
				}
			})
			.error(function(response){
				//console.log("ERROR COMING BACK FROM SERVER...");
				$scope.submitClass = '';
			});
		}

		$scope.TakeMeHome = function(){
			window.location = '/';
		}

		//console.log("Finished TakeCtrl...");
	})
	.controller('ResultsCtrl', function($scope, $http, $state, $stateParams, $location, $anchorScroll){
		//console.log("USING THE RESULTS CONTROLLER");


		window.top.postMessage("change", "*");
		//console.log("Just posted message to top");

		$scope.GetResults = function(){
			//console.log("About to look up results.");
			if($scope.email == '' || $scope.email == null){
				//console.log("Email address no good!");
				return;
			}
			$http({
				url: '/response',
				method: 'GET',
				params: {id: $stateParams.id, email: $scope.email}
			})
			.success(function(response){
				//console.log("Successful response when looking up results");
				if(response.status == 'success'){
					//console.log("WOO WOO");
					$scope.quiz = response.data.quiz;
					$scope.responses = response.data.responses;
				}else{
					//console.log("App said aww hell naw: " + response.message);
				}
			})
			.error(function(response){
				//console.log("Error response when looking up results");
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
					//console.log("Successful response when looking up results");
					if(response.status == 'success'){
						//console.log("WOO WOO");
						$scope.quiz = response.data.quiz;
						$scope.responses = response.data.responses;
					}else{
						//console.log("App said aww hell naw: " + response.message);
					}
				})
				.error(function(response){
					//console.log("Error response when looking up results");
				});
			}else{
				//console.log("Invalid quiz ID to auto-load");
			}
		}else{
			//console.log("Invalid email address to auto-load");
		}
	})
;