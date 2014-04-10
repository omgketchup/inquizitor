var app = angular.module('app', [ 'ngAnimate','ui.router', 'ui.bootstrap', 'ngSanitize'
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
			url:'/viewResults/:id/:email/:responseId',
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
			console.debug(response.user);
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

		$scope.downloadAsCsv = function(){
			console.log("About to download as CSV");
			if($scope.responses != null && typeof($scope.responses) != 'undefined'){
				var data = $scope.responses;
				console.log("Abotu to loop through and create a CSV file");

				//MAYBE
		            var array = (typeof(data) != 'object') ? JSON.parse(data) : data;
		            console.log("89...");
		            var str = '';

		            for (var i = 0; i < array.length; i++) {
		                var line = '';
		                for (var index in array[i]) {
		                    if (line != '') line += ','

		                    line += array[i][index];
		                }

		                str += line + '\r\n';
		            }
		        //MAYBE NOT

				console.log("Created CSV file, here's the raw text: ");
				console.log(str);
			}
		}
	})
	.controller('ViewResultsCtrl', function($scope, $http, $stateParams){
		console.log("USING VIEW RESULTS CONTROLLER");
		console.debug($stateParams);
		$scope.email = $stateParams.email;
		$scope.responseId = $stateParams.responseId;

		$http({
			url:'/specresponse',
			method:'GET',
			params: {
				responseId: $stateParams.responseId
			}
		})
		.success(function(response){
			if(response.status == 'success'){
				$scope.response = response.data.response;
				console.log("GOT SUCCESS FROM SERVER, RESPONSE IS DISPLAYED");
				console.debug($scope.response);
			}else{
				console.log("BAD DATA FROM SERVER: " + response.message);
			}
		})
		.error(function(response){
			console.log("SERVER THREW AN ERROR");
		})

		/*
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
			console.log("Something is not right.");
		})
		*/

		console.log("DONE WITH VIEW RESULTS CONTROLLER");
	})
	.controller('ListCtrl', function($scope, $http){
		console.log("Using ListCtrl");
		var quizzes = [];

		/* GET ALL MY QUIZZES ON INIT */
		$scope.GetAllQuizzes = function(){
			$http.get('/quizzes')
			.success(function(response){
				if(response.status == 'success'){
					$scope.quizzes = response.quizzes;
				}else{
					if(response.code == '401'){
						this.window.location = '/';
					}
				}
			})
			.error(function(response){
				//console.log("Some kind of error... " + response);
			});
		}
		$scope.GetAllQuizzes();
		

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

		$scope.CopyQuiz = function(quiz){
			console.log("Attempting to copy quiz " + quiz._id);
			
			$http.post('/copyquiz', 
				{idToCopy:quiz._id}
			)
			.success(function(response){
				console.log("Success");
				if(response.status == 'success'){
					$scope.GetAllQuizzes();
				}else{
					alert("That action was unsuccessful, the quiz was not copied.");
				}
			})
			.error(function(response){
				console.log("Error");
			});
		}
	})
	.controller('ModalInstanceCtrl', function($scope, $http, $fileUpload, $modalInstance, data){
		console.log("Awwwwwwwwwwwwwww yeah.");
		console.log(data.choice.img);
		console.log("Data comin out.");
		console.debug(data);
		if(typeof(data.choice.img) != 'undefined'){
			$scope.form = {newurl:""};
			$scope.form.newurl = data.choice.img;
		}else{
			$scope.form = {newurl: ''}
		}
		$scope.data = data;
		$scope.formy = {};
		$scope.UploadImage = function(files){
			console.log("Uploading image...");
			console.dir(files[0]);
			var fd = new FormData();

		    //Take the first selected file
		    fd.append("file", files[0]);

		    $http.post('/upload', fd, {
		        headers: {'Content-Type': undefined },
		        transformRequest: angular.identity
		    })
		    .success( function(response){
		    	if(response.status == 'success'){
		    		data.choice.img = response.data;
		    		$scope.form.newurl = response.data;
		    		var url = $scope.form.newurl;
		    		if(url == '' || typeof(url) == 'undefined'){
						alert("You need to use an existing link or upload a file!");
						return;
					}
					data.choice.img = '';
					data.choice.img = url;
		    	}else{
		    	}
		    })
		    .error( function(response){
		    	console.log("Error upload!");
		    });
		}

		$scope.AttachImage = function(url){
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
		console.log("Set the quiz type to options 0: " + $scope.quiz.type);

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
			isPublic:false,
			updateResponses:true
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

		$scope.ShowAdvancedOptions = function(){
			console.log("Showing advanced options:");
			console.debug($scope.quiz.advancedOptions);
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
			var newQ = {text:question.text, type: question.type, choices: question.choices};
			if(confirm("IMPORTANT: If you copy a question in-place by clicking OK, it could break any existing responses.  BE CAREFUL.  Click cancel to copy this question to the end of the quiz.")){
				var ind = $scope.quiz.questions.indexOf(question);
				$scope.quiz.questions.splice(ind, 0, newQ);
			}else{
				console.log("Opted out of copying a question");
				$scope.quiz.questions.push(newQ);
			}
		}
		$scope.DeleteQuestion = function(question){
			$scope.quiz.questions.splice($scope.quiz.questions.indexOf(question), 1);
		}

		$scope.AddChoice = function(question){
			if(typeof(question.choices) == 'undefined' || question.choices == null){
				question.choices = [];
			}
			if(question.choices.length > 9){
				alert("Sorry, you can't add any more choices!");
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

			console.log("DO WE HAVE ADVANCED OPTIONS HERE:  " + $scope.quiz.type);
			
			if($scope.quiz.advancedOptions.multipleResponses){
				$scope.quiz.advancedOptions.updateResponses = false;
			}
			$scope.quiz.advancedOptions = {
				resultType : $scope.quiz.type, 
				multipleResponses: $scope.quiz.advancedOptions.multipleResponses, 
				updateResponses: $scope.quiz.advancedOptions.updateResponses
			};
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
	.directive('fileModel', ['$parse', function ($parse) {
	    return {
	        restrict: 'A',
	        link: function(scope, element, attrs) {
	            var model = $parse(attrs.fileModel);
	            var modelSetter = model.assign;
	            
	            element.bind('change', function(){
	                scope.$apply(function(){
	                    modelSetter(scope, element[0].files[0]);
	                });
	            });
	        }
	    };
	}])
	.service('$fileUpload', ['$http', function ($http) {
	    this.uploadFileToUrl = function(file, uploadUrl){
	        var fd = new FormData();
	        fd.append('file', file);
	        $http.post(uploadUrl, fd, {
	            transformRequest: angular.identity,
	            headers: {'Content-Type': undefined}
	        })
	        .success(function(){
	        })
	        .error(function(){
	        });
	    }
	}])
	.filter('orderObjectBy', function(){
	 	return function(input, attribute) {
		    if (!angular.isObject(input)) return input;

		    var array = [];
		    for(var objectKey in input) {
		        array.push(input[objectKey]);
		    }

		    array.sort(function(a, b){
				var alc = a[attribute].toLowerCase(),
				    blc = b[attribute].toLowerCase();
				return alc > blc ? 1 : alc < blc ? -1 : 0;
			});
		    return array;
		}
	});
;