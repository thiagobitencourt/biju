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
  // add a response interceptor
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {

      if(response.status == 403){
        console.log("Unauthorized... ");
        window.location = window.location.origin + '/login';
      }
    /*
      var extractedData;
      // .. to look for getList operations
      if (operation === "getList") {
        // .. and handle the data and meta data
        extractedData = data.data.data;
        extractedData.meta = data.data.meta;
      } else {
        extractedData = data.data;
      }
      return extractedData;
      */
      return data;
    });


  // change the default id for put and get on url
  RestangularProvider.setRestangularFields({ id: "_id" });

  // set default header "token"
  // RestangularProvider.setDefaultHeaders({'Authorization' : 'Bearer defaulttokenaccess' });

    $routeProvider.
      when('/', {
        redirectTo: '/kits'
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
      when('/pagar-kit', {
        templateUrl: 'view/Kit/kit-pagar.html',
        controller: 'kitsCtrl'
      }).
      when('/rel-divporpessoa-config', {
        templateUrl: 'view/rel/divporpessoa-config.html',
        controller: 'relDivPorPessoaCtrl'
      }).
      when('/rel-divporpessoa-view', {
        templateUrl: 'view/rel/divporpessoa-view.html',
        controller: 'relDivPorPessoaCtrl'
      }).
      when('/rel-kits-config', {
        templateUrl: 'view/rel/kits-config.html',
        controller: 'relKitsCtrl'
      }).
      when('/rel-kits-view', {
        templateUrl: 'view/rel/kits-view.html',
        controller: 'relKitsCtrl'
      }).
      when('/rel-kitsnapraca-config', {
        templateUrl: 'view/rel/kitsnapraca-config.html',
        controller: 'relKitsNaPracaCtrl'
      }).
      when('/rel-kitsnapraca-view', {
        templateUrl: 'view/rel/kitsnapraca-view.html',
        controller: 'relKitsNaPracaCtrl'
      }).
      when('/manual-data-import', {
        templateUrl: 'view/manualdataimport/manual-data-import.html',
        controller: 'manualDataImportCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });

});

//adicionando a funcao addDAys para qualquer instancia de data
Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + days);
  return this;
};
