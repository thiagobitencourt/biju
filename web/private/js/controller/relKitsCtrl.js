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

        paginate(pages, kit.itens);

        kit.pages = pages;
      }


      $scope.relKitsReport = response;
    });

  }else{
    console.log('pau em relKitsCtrl');
  }

  var paginate = function(masterArray, currentArray){
    var limitPageMax = 35;
    var limitPageMin = 30;
    var limitLastPageMin = limitPageMax - limitPageMin;

    var itemsNumber = currentArray.length;

    if(itemsNumber <= limitPageMax){
      masterArray.push(currentArray);
      return;
    }

    var rest = itemsNumber - limitPageMax;
    if(rest < limitLastPageMin){
      //ultima pagina e tem muito pouco item. vamos puxar um pouco da ultima.
      var nextArray = currentArray.splice(limitPageMin, itemsNumber);
      masterArray.push(currentArray);
      paginate(masterArray, nextArray);
    }else{
      var nextArray = currentArray.splice(limitPageMax, itemsNumber);
      masterArray.push(currentArray);
      paginate(masterArray, nextArray);
    }

  }

});
