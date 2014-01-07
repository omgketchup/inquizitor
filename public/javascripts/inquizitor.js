var app = angular.module('app', [ 'ngAnimate','ui.router', 'ui.bootstrap'
	])
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/');

		$stateProvider
		.state('home', {
			url:'/',
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
		.state('view', {
			url:'/view/:id',
			templateUrl: 'javascripts/templates/view.html',
			controller: 'ViewCtrl'
		})
		.state('analytics', {
			url:'/analytics/:id',
			templateUrl: 'javascripts/templates/analytics.html',
			controller: 'AnalyticsCtrl'
		})
		.state('viewResults', {
			url:'/viewResults/:id/:email',
			templateUrl: 'javascripts/templates/viewResults.html',
			controller: 'ViewResultsCtrl'
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
	}).controller('ViewCtrl', function($scope, $http){
		console.log("Using the ViewCtrl");
		
	})
	.controller('AnalyticsCtrl', function($scope, $http, $stateParams){
		console.log("Using the analytics controller...");
		//GET ALL RESPONSES TO THIS QUIZ SO YOU CAN LIST'EM
		$http({
			url:'/responses',
			method:'GET',
			params: {
				id: $stateParams.id
			}
		})
		.success(function(response){
			console.log("SUCCESS GETTING A LIST OF RESPONSES");
			$scope.responses = response.data.responses;
			$scope.quiz = response.data.quiz;
			console.log("There were like, a lot of them. " + $scope.responses.length);
			console.debug($scope.responses);
		})
		.error(function(response){
			console.log("ERROR FROM SERVER WHEN GETTING A LIST OF RESPONSES");
		})
	})
	.controller('ViewResultsCtrl', function($scope, $http, $stateParams){
		console.log("USING VIEW RESULTS CONTROLLER");
		console.debug($stateParams);
		$scope.email = $stateParams.email;

		$http({
			url:'/response',
			method:'GET',
			params:{
				id:$stateParams.id,
				email: $stateParams.email
			}
		})
		.success(function(response){
			console.log("Got a response");
			if(response.status == 'success'){
				console.log("Got a successful response...");
				$scope.quiz = response.data.quiz;
				$scope.response = response.data.responses;
				console.debug($scope.response);
			}else{
				console.log("Got a failure response.");
			}

		})
		.error(function(response){
			console.log("Something fucked up.");
		})


		console.log("DONE WITH VIEW RESULTS CONTROLLER");
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

		$scope.DeleteQuiz = function(quiz){
			console.log("Attempting to delete a quiz named " + quiz.name + " with the ID: " + quiz._id);
			if(window.confirm("Are you sure? This action is permanent, and you cannot undo it.")){
				$http({
					url:'/quiz',
					method: 'DELETE',
					params: {_id:quiz._id}
				})
				.success(function(response){
					if(response.status == 'success'){
						$scope.quizzes.splice($scope.quizzes.indexOf(quiz), 1);
					}else{
						console.log("App server failed at deleting item.");
						$scope.errorMessage = "Could not delete that item.";
					}
					
				})
				.error(function(response){
					console.log("What the front door " + response);
				});
			}else{
				console.log("Decided I didn't actually want to delete that, it's cool.");
			}
			
		}
	})
	.controller('ModalInstanceCtrl', function($scope, $modalInstance, data){
		console.log("Awwwwwwwwwwwwwww yeah.");
		console.log(data.choice.img);
		console.log("Data comin out.");
		console.debug(data);
		if(typeof(data.choice.img) != 'undefined'){
			$scope.form = {newurl:""};
			$scope.form.newurl = data.choice.img;
		}
		$scope.data = data;
		//ONLY WORING FOR THE FIRST ITEM IN EACH QUESTION FIX THIS AFTER LUNCH.
		$scope.AttachImage = function(url){
			console.log("FUCKIN URL IS: " + url);
			console.log("Attempting to attach an item.");
			if(url == '' || typeof(url) == 'undefined'){
				alert("You need to use an existing link or upload a file!");
				return;
			}
			data.choice.img = '';
			data.choice.img = url;
			$modalInstance.dismiss('cancel');
		}

		$scope.Cancel = function(){
			$modalInstance.dismiss('cancel');
		}
	})
	.controller('EditCtrl', function($scope, $http, $modal, $stateParams){
		$scope.quiz = {};

		$scope.quizTypeOptions = [
			{name:"Poll", value:"poll"},
			{name:"Self", value:"self"}
		]

		$scope.typeOptions = [
			{name:"Multiple Choice", value:"multiple_choice"},
			{name:"Free Response", value:"free_response"},
			{name:"Media Link", value:"media_link"},
			{name:"Media Upload", value:"media_upload"}
		];
		$scope.quiz.advancedOptions = {
			timeLimit:0,
			expirationDT:0,
			resultType:"self",
			isPublic:false
		} //self shows your own results, poll shows the totals, will add more later.

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
					console.debug(response.quiz);
					$scope.quiz = response.quiz;
					console.debug($scope.quiz);
					console.log("QUIZ NUMTAKERS: " + response.quiz.numba + ", " + response.message);
				}else{
					console.log("Failure from /quiz.");
				}
			});
		}else{
			//Populate $scope.quiz with a brand new quiz.
			$scope.quiz = {};
		}

		$scope.ShowAnalytics = function(id){
			console.log("About to load analytics...");

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
			if($scope.quiz.type == "poll" || $scope.quiz.type == 'Poll'){
				console.log("Pre-selecting multiple choice as default");
				newQuestion.type = 'multiple_choice';
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
			var newChoice = {text:'', isAnswer:false}
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

		/*
		*
		* MODAL OPEN/CLOSE AND CONTROLLER
		*
		*/
		$scope.AddUploadToChoice = function(question, choice){
			console.log("About to open a modal to upload an image...");
			var data = {
				question: question,
				choice: choice
			}
			$scope.data = data;
			var modalInstance = $modal.open({
				templateUrl: '/javascripts/templates/modal_template.html',
				controller: 'ModalInstanceCtrl',
				resolve: {
						data: function(){
						return data;
					}
				}
			});
		}

		//END MODAL STUFF

		$scope.ToggleAnswer = function(question, choice){
			console.log("Toggling an answer to be correct or not... ");
			for(var i = 0; i<question.choices.length; i++){
				var q = question.choices[i];
				q.isCorrect = false;
			}
			choice.isCorrect = true;
			console.debug(question);
		}

		$scope.savingAllowed = true;

		$scope.SaveQuiz = function(){
			if($scope.savingAllowed == false){
				alert("Can't save right now!");
				return;
			}

			console.log("DO WE HAVE ADVANCED OPTIONS HERE");
			console.debug($scope.quiz.advancedOptions);
			$scope.savingAllowed = false;
			var saveQuiz = $scope.quiz;

			if(saveQuiz.type == 'Poll' || saveQuiz.type == 'poll'){
				for(var i = 0; i < saveQuiz.questions.length; i++){
					var q = saveQuiz.questions[i];
					if(q.type != 'multiple_choice'){
						alert("Sorry, you can't save a poll with questions that are not multiple choice.  Change the type, or change the questions.");
						$scope.savingAllowed = true;
						$scope.quiz.type = {name:"Self", value:"self"};
						return;
					}
				}
			}
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