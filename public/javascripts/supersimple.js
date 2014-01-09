var app = angular.module('app', [ 
	])
	.controller('SignupCtrl', function($scope, $http){
		// ?
	})
	.controller('LoginCtrl', function($scope){
		// ?
	})
	.directive('match',['$parse', function ($parse) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch(function() {
                    return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || $parse(attrs.match)(scope) === ctrl.$modelValue;
                }, function(currentValue) {
                    ctrl.$setValidity('match', currentValue);
                });
            }
        };
    }]);
;
