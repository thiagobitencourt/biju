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
      query.pessoa = config.pessoaId;

    if(config.kitId !== 'todos'){
      query._id = config.kitId;
    }

    if(config.estado !== 'todos'){
      query.estado = config.estado;
    }

    $scope.relKitsConfig = config;
    $scope.relKitsReport = {};
    // Restangular.all('kit').getList({q : query}).then(function(response){
    //   $scope.relKitsReport = response;
    // });

    Restangular.one('rel', 'relKits').get({q : query }).then(function(response){



      var kits = response.plain();

      for (var i in kits){
        var kit = kits[i];
        var pages = [];

        var sortedItens = kit.itens.sort(function(a,b){
          if (a.produto.tipo > b.produto.tipo) {
            return 1;
          }
          if (a.produto.tipo < b.produto.tipo) {
            return -1;
          }
          // a must be equal to b
          return 0;
        });

        paginate(pages, sortedItens);



        kit.pages = pages;
      }


      $scope.relKitsReport = response;
    });

  }else{
    console.log('pau em relKitsCtrl');
  }

  var paginate = function(masterArray, currentArray){
console.log('1');
    var limitPageMax = 35;
    var limitPageMin = 30;
    var limitLastPageMin = limitPageMax - limitPageMin;

    var itemsNumber = currentArray.length;

    console.log("master", masterArray);
    console.log("current",currentArray)
    console.log("itemsNumber", itemsNumber);

    if(itemsNumber <= limitPageMax){
      console.log('menor' + itemsNumber);
      masterArray.push(currentArray);
      return;
    }

    var rest = itemsNumber - limitPageMax;
console.log("rest", rest);
    if(rest < limitLastPageMin){
      //ultima pagina e tem muito pouco item. vamos puxar um pouco da ultima.


      var nextArray = currentArray.splice(limitPageMin, itemsNumber);
      masterArray.push(currentArray);
      paginate(masterArray, nextArray);
    }else{
      console.log("current1",currentArray)
      var nextArray = currentArray.splice(limitPageMax, itemsNumber);
      console.log("current2",currentArray)
      masterArray.push(currentArray);
      paginate(masterArray, nextArray);
    }

  }

});
