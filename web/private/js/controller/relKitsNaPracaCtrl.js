var app = angular.module('bijuApp');
app.controller('relKitsNaPracaCtrl', function($rootScope, $scope, Restangular, shareData, $location){
  var currentRoute = $location.path();

  $scope.relKitsNaPracaConfig = {
    pessoaId : 'todas',
    pessoaRefId : 'todas',
    apenasConsolidado : false,
    pessoaRefElaMesma : false
  }

  if(currentRoute === '/rel-kitsnapraca-config'){

    var pessoaService = Restangular.service('pessoa');
    $scope.pessoas = pessoaService.getList().$object;
    $scope.setConfig = function(){
      shareData.set('relKitsNaPracaConfig', $scope.relKitsNaPracaConfig);
    }

  }else if (currentRoute === '/rel-kitsnapraca-view'){

    var query = {};
    query.estado = 'Entregue';

    var config = shareData.get('relKitsNaPracaConfig');
    if(!config){
      config = $scope.relKitsNaPracaConfig;
    }

    if(config.pessoaId !== 'todas')
      query.pessoaId = config.pessoaId;

    if(config.pessoaRefId !== 'todas'){
      query.pessoaRefId = config.pessoaRefId;
      query.pessoaRefElaMesma = config.pessoaRefElaMesma;
    }

    $scope.relKitsNaPracaConfig = config;
    $scope.relKitsNaPracaReport = {};

    // Restangular.all('kit').getList({q : query}).then(function(response){
    //   $scope.relKitsNaPracaReport = response;
    // });

    //reusing the rel.
    Restangular.one('rel', 'relKitsNaPraca').get({q : query }).then(function(response){
      $scope.relKitsNaPracaReport = response;
    });

  }else{
    console.log('pau em relKitsNaPracaCtrl');
  }

});
