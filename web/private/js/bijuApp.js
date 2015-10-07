var app = angular.module('bijuApp', 
  ['ngRoute', 
  'ngTouch', 
  'ngAnimate',
  'ngSanitize',
  'restangular',
  'ui.bootstrap',
  'ui.grid', 
  'ui.grid.pagination',
  'ui.grid.selection', 
  'ui.utils.masks',
  'idf.br-filters']);

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
        templateUrl: 'view/Pessoa/pessoas.html',
        controller: 'pessoasCtrl'
      }).
      when('/produtos', {
        templateUrl: 'view/Produto/produtos.html',
        controller: 'produtosCtrl'
      }).
      when('/estoques', {
        templateUrl: 'view/Estoque/estoques.html',
        controller: 'estoquesCtrl'
      }).   
      when('/users', {
        templateUrl: 'view/User/users.html',
        controller: 'usersCtrl'
      }).
      when('/kits', {
        templateUrl: 'view/Kit/kits.html',
        controller: 'kitsCtrl'
      }).
      when('/detalhes-kit', {
        templateUrl: 'view/Kit/kit-detalhes.html',
        controller: 'kitsCtrl'
      }).
      when('/editar-kit', {
        templateUrl: 'view/Kit/kit-editar.html',
        controller: 'kitsCtrl'
      }).
      when('/gerar-kit', {
        templateUrl: 'view/Kit/kit-gerar.html',
        controller: 'kitsCtrl'
      }).
      when('/entregar-kit', {
        templateUrl: 'view/Kit/kit-entregar.html',
        controller: 'kitsCtrl'
      }).
      when('/fechar-kit', {
        templateUrl: 'view/Kit/kit-fechar.html',
        controller: 'kitsCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  
});