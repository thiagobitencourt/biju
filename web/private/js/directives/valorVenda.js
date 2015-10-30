var app = angular.module('bijuApp');
app.directive('valorVenda', function() {
  return {
    require: 'ngModel',
    scope: {
      valorVenda: '=valorVenda',
      valorCusto: '=ngModel'
    },
    link: function (scope, elem, attrs, ngModel) {
      var calc = function(){
        var vlr = parseFloat(scope.valorCusto);
        var vlrVnd = vlr * 1.5;
        vlrVnd = Math.ceil(vlrVnd);
        scope.valorVenda = vlrVnd;
      }
      scope.$watch('valorCusto', function() {
          calc();//ngModel.$validate();
      });
    }
  }
});
