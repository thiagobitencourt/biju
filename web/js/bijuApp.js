// var app = angular.module('bijuApp', []);
var app = angular.module('bijuApp', ['ngRoute']);

app.config(function($routeProvider) {

    $routeProvider.
      when('/', {
        templateUrl: 'view/dashboard.html',
        controller: 'bijuCtrl'
      }).
      when('/pessoas', {
        templateUrl: 'view/pessoas.html',
        controller: 'pessoasCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  
});