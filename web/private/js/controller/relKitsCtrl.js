var app = angular.module('bijuApp');
app.controller('relKitsCtrl', function($rootScope, $scope, Restangular, shareData, $location){
  var currentRoute = $location.path();

  $scope.relKitsConfig = {
    pessoaId : 'todas',
    kitId : 'todos',
    estado : 'todos'
  }

  if(currentRoute === '/rel-kits-config'){

    var pessoaService = Restangular.service('pessoa');
    $scope.pessoas = pessoaService.getList().$object;

    Restangular.all('kit').getList().then(function(response){
      $scope.kits = response;
    });

    $scope.setConfig = function(){
      shareData.set('relKitsConfig', $scope.relKitsConfig);
    }

  }else if (currentRoute === '/rel-kits-view'){

    var query = {};

    var config = shareData.get('relKitsConfig');
    if(!config){
      config = $scope.relKitsConfig;
    }

    if(config.pessoaId !== 'todas')
      query.pessoaId = config.pessoaId;

    if(config.kitId !== 'todos'){
      query._id = config.kitId;
    }

    if(config.estado !== 'todos'){
      query.estado = config.estado;
    }

    $scope.relKitsConfig = config;
    $scope.relKitsReport = {};
    Restangular.all('kit').getList({q : query}).then(function(response){
      $scope.relKitsReport = response;
    });

  }else{
    console.log('pau em relKitsCtrl');
  }

});
