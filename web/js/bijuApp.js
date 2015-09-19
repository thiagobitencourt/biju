var app = angular.module('bijuApp', 
  ['ngRoute', 
  'ngTouch', 
  'ngAnimate',
  'restangular',
  'ui.bootstrap',
  'ui.grid', 
  'ui.grid.pagination']);

app.config(function($routeProvider, RestangularProvider) {
  //set the base url for api calls on our RESTful services
  var newBaseUrl = "";
  if (window.location.hostname == "localhost") {
    newBaseUrl = "https://localhost:8143/api";
  } else {
    var deployedAt = window.location.href.substring(0, window.location.href);
    newBaseUrl = deployedAt + "/api";
  }

  RestangularProvider.setBaseUrl(newBaseUrl);

  // change the default id for put and get on url 
  RestangularProvider.setRestangularFields({ id: "_id" });

  // set default header "token"
  // RestangularProvider.setDefaultHeaders({'Authorization' : 'Bearer defaulttokenaccess' });

    $routeProvider.
      when('/', {
        templateUrl: 'view/dashboard.html',
        controller: 'bijuCtrl'
      }).
      when('/pessoas', {
        templateUrl: 'view/pessoas.html',
        controller: 'pessoasCtrl'
      }).
      when('/produtos', {
        templateUrl: 'view/produtos.html',
        controller: 'produtosCtrl'
      }).   
      when('/users', {
        templateUrl: 'view/users.html',
        controller: 'usersCtrl'
      }).          
      otherwise({
        redirectTo: '/'
      });
  
});