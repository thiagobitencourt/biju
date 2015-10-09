var app = angular.module('bijuApp');
app.directive('produtoAvailable', function($timeout, Restangular) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ngModel) {
      ngModel.$asyncValidators.produtoAvailable = function(referencia) {
       return $timeout(function() {
          if(angular.isDefined(referencia)){
            Restangular.one('produto').get({"q":{"referencia":referencia}})
            .then( function(response){
              if(response.length > 0){
                scope.errorProdutoMessage = false;
                scope.produtoAvailableDescription = response[0].descricao;
              }else{
                scope.produtoAvailableDescription = false;
                scope.errorProdutoMessage = "Referencia Produto Não Existe!";
              }
            });
          }
       }, 100);
      };
    }
  }
});
