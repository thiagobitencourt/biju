var app = angular.module('bijuApp');
app.controller('relKitsNaPracaCtrl', function($rootScope, $scope, Restangular, shareData, $location){
  var currentRoute = $location.path();

  $scope.relKitsNaPracaConfig = {
    pessoaId : 'todas',
    apenasConsolidado : false
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

    $scope.relKitsNaPracaConfig = config;
    $scope.relKitsNaPracaReport = {};

    // Restangular.all('kit').getList({q : query}).then(function(response){
    //   $scope.relKitsNaPracaReport = response;
    // });

    //reusing the rel.
    Restangular.one('rel', 'relDividaPorKit').get({q : query }).then(function(response){
      $scope.relKitsNaPracaReport = response;
    });

  }else{
    console.log('pau em relKitsNaPracaCtrl');
  }

});
