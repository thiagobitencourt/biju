var app = angular.module('bijuApp');
app.controller('bijuCtrl', function($rootScope, $scope, $location){
	
	$rootScope.isActive = function (viewLocation) { 
    return viewLocation === $location.path();
  };

});