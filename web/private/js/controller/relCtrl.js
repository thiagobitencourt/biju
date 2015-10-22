var app = angular.module('bijuApp');
app.controller('relCtrl', function($rootScope, $scope, Restangular, shareData, $location){
  var currentRoute = $location.path();

  if(currentRoute === '/rel-divporpessoa-config'){
    var pessoaService = Restangular.service('pessoa');
    $scope.pessoas = pessoaService.getList().$object;
    $scope.relDividaPorKitConfig = {
      pessoaId : 'todas'
    }
    $scope.setConfig = function(){
      shareData.set('relDividaPorKitConfig', $scope.relDividaPorKitConfig);
    }
  }else if (currentRoute === '/rel-divporpessoa-view'){
    var query = {};
    var config = shareData.get('relDividaPorKitConfig');
    if(!config){
      query.pessoaId = 'todas';
    }else{
      query.pessoaId = config.pessoaId;
    }

    $scope.relDividaPorKitReport = {};
    Restangular.one('rel', 'relDividaPorKit').get({q : query }).then(function(response){
      $scope.relDividaPorKitReport = response;
    });
  }

});
