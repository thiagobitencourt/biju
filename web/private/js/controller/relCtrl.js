var app = angular.module('bijuApp');
app.controller('relCtrl', function($rootScope, $scope, Restangular){
  // var kitService = Restangular.service('rel/relDividaPorKit');
  // kitService.getList().then(function(response){
  //   $scope.relatorio = response;
  // });
  Restangular.one('rel', 'relDividaPorKit').get().then(function(response){
    $scope.relatorio = response;
  });
});
