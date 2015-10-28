var app = angular.module('bijuApp');
app.controller('relDivPorPessoaCtrl', function($rootScope, $scope, Restangular, shareData, $location){
  var currentRoute = $location.path();

  $scope.relDividaPorKitConfig = {
    pessoaId : 'todas',
    mostrarResumo : false,
    somenteDividaAtiva: false,
    apenasConsolidado: false
  }

  if(currentRoute === '/rel-divporpessoa-config'){
    var pessoaService = Restangular.service('pessoa');
    $scope.pessoas = pessoaService.getList().$object;
    $scope.setConfig = function(){
      shareData.set('relDividaPorKitConfig', $scope.relDividaPorKitConfig);
    }
  }else if (currentRoute === '/rel-divporpessoa-view'){
    var query = {};
    var config = shareData.get('relDividaPorKitConfig');
    if(!config){
      config = $scope.relDividaPorKitConfig;
    }

    query.estado = 'Fechado';
    query.pessoaId = config.pessoaId;
    query.somenteDividaAtiva = config.somenteDividaAtiva;

    $scope.relDividaPorKitConfig = config;
    $scope.relDividaPorKitReport = {};
    Restangular.one('rel', 'relDividaPorKit').get({q : query }).then(function(response){
      $scope.relDividaPorKitReport = response;
    });
  }else{
    console.log('pau em relDivPorPessoaCtrl');
  }

});
