var app = angular.module('bijuApp');
app.controller('manualDataImportCtrl', function($rootScope, $scope, Restangular, shareData){

  var pessoaService = Restangular.service('pessoa');
  var kitService = Restangular.service('kit');
  var produtoService = Restangular.service('produto');

  $scope.pessoas = pessoaService.getList().$object;

  var parsedContent = null;
  var totalChecksNeeded = null;
  var itensBackendCheck = null;
  $scope.itens = null;
  $scope.kitError = null;
  $scope.kitSaved = null;
  $scope.kit = null;
  $scope.itensCount = null;
  $scope.kitErrorMessage = null;

  var reset = function(){
    parsedContent = null;
    itensBackendCheck = {};
    $scope.itens = {};
    totalChecksNeeded = 0;
    $scope.kitError = false;
    $scope.kitSaved = false;
    $scope.itensCount = 0;
    $scope.kitErrorMessage = "Não foi possível importar o kit.";
    $scope.kit = {
       "_id": null,
       "codigoPersonalizado" : null,
       "pessoa" : null,
       "estado" : "Gerado",
       "dataDevolucao":null,
       "dataGeracao": new Date().toISOString(),
       "deletedAt":null,
       "vlrTotalPgto":0,
       "pagamentos":[],
       "vlrTotalDivida":0,
       "vlrTotalKit":0,
       "itens":[],
       "dataProxRetorno":null,
       "dataEntrega":null
    };
  }
  reset();

  $scope.parseFile = function($fileContent){
    reset();
    parsedContent = csvToArray($fileContent);
    parseKit();
  };

  $scope.importarKit = function(){
    var totalChecksDone = 0;

    for (var k in itensBackendCheck){

      var item = itensBackendCheck[k];
      $scope.itens[item.referencia].importStatus = 'Verificando';

      Restangular.one('produto').get({"q":{"referencia":item.referencia}})
      .then( function(response){
        if(response.length > 0){
          totalChecksDone++;
          $scope.itens[response[0].referencia].importStatus = 'OK';
          $scope.itens[response[0].referencia]._id = response[0]._id;
          if(totalChecksDone === totalChecksNeeded)
            saveKit();
        }else{
          $scope.itens[item.referencia].importStatus = 'Criando';
          produtoService.post(itensBackendCheck[response.reqParams.q.referencia]).then(
            function(postResponse){
              totalChecksDone++;
              $scope.itens[response.reqParams.q.referencia].importStatus = 'OK';
              $scope.itens[postResponse.referencia]._id = postResponse._id;
              if(totalChecksDone === totalChecksNeeded)
                saveKit();
            },
            function(error){
              totalChecksDone++;
              $scope.kitError = true;
              $scope.itens[response.reqParams.q.referencia].importStatus = 'Erro : ' + error.data.message;
              if(totalChecksDone === totalChecksNeeded)
                saveKit();
            }
          );

        }
      },
    function(error){
      console.log(error);
      $scope.kitError = true;
    });

    }
  }

  var saveKit = function(){
    if($scope.kitError){
      console.log('não é possível salvar kit contendo erros.');
      return;
    }
    if($scope.kit.pessoa && $scope.kit.pessoa !== '')
      $scope.kit.estado = 'Entregue';

    if($scope.kit.dataEntrega){
      var _dataProxRetorno = new Date();
      _dataProxRetorno.setDate($scope.kit.dataEntrega.getDate() + 30);
      $scope.kit.dataProxRetorno = _dataProxRetorno;
    }

      if($scope.kit.itens.length === 0){
        for (var i in $scope.itens){
          var item = $scope.itens[i];
          $scope.kit.itens.push({
            produto : item._id,
            vlrUnit : item.fieldPreco,
            vlrTotal: item.fieldTotal,
            qtdeDevolvida:0,
            qtdeEntregue: item.fieldQuant
          });
        }
      }

    kitService.post($scope.kit).then(
      function(response){
        $scope.kitSaved = "Kit importado com sucesso. Código do kit: " + response.codigoPersonalizado;
      },
      function(error){
        $scope.kitErrorMessage += " Erro ao enviar ao servidor: " + error.data.message;
        $scope.kitError = true;
      }
    );
  }

  var parseKit = function(data){
    var itemsSection = false;
    for (var i in parsedContent){
      var line = parsedContent[i];
      var kit = {};

      if(line.length === 6 && line[0] !== ''){

        var fieldQuant = line[0];
        var fieldRef = line[1];
        var fieldDescricao = line[2];
        var fieldTam = line[3];
        var fieldPreco = line[4];
        var fieldTotal = line[5];

        // && fieldDescricao.trim() === 'DESCRIÇÃO'
      // && fieldTam.trim() === 'TAM' && fieldPreco.trim() === 'PREÇO UNT' && fieldTotal.trim() === 'TOTAL'
        if(!itemsSection){
          if(fieldQuant.trim() === 'QUANT' && fieldRef.trim() === 'REF'){
              itemsSection = true;
              continue;
          }
        }else{
          //estamos na seção de itens

          fieldRef = fieldRef.trim();
          fieldDescricao = fieldDescricao.trim();
          fieldTam = fieldTam.trim();
          fieldPreco = parseFloat((fieldPreco.replace('R$', '').replace(',', '.')).trim());
          fieldQuant = parseInt(fieldQuant.trim());
          fieldTotal = parseFloat((fieldTotal.replace('R$', '').replace(',', '.')).trim());

          $scope.kit.vlrTotalKit += fieldTotal;

          var vlrVendaCalc = 0;
          if(fieldPreco){
              vlrVendaCalc = fieldPreco * 1.5;
              vlrVendaCalc = Math.ceil(vlrVendaCalc);
          }

          $scope.itens[fieldRef] = {
            importStatus : ' - ',
            fieldQuant: fieldQuant,
            fieldRef : fieldRef,
            fieldDescricao : fieldDescricao,
            fieldTam : fieldTam,
            fieldPreco : fieldPreco,
            fieldTotal : fieldTotal
          };


          itensBackendCheck[fieldRef] = {
            referencia : fieldRef,
            tipo : fieldDescricao,
            tamanho : fieldTam,
            vlrCusto : fieldPreco,
            vlrVenda : vlrVendaCalc
          };

          totalChecksNeeded++;
        }
      }
    }
    $scope.itensCount = totalChecksNeeded;

    if(!itemsSection){
      $scope.kitError = true;
      $scope.kitErrorMessage = "Arquivo com formato inválido.";
    }
  }

  var parsePessoa = function(data){
    return data;
  }

  var csvToArray = function(data){
    var lineSeparator = '\r';
    var fieldSeparator = ';';

    if(data.indexOf('\n') !== -1)
      lineSeparator = '\n';

    var lines = data.split(lineSeparator);
    var result = [];
    for (var i in lines){
      var line = lines[i];
      var fields = line.split(fieldSeparator);
      result.push(fields);
    }
    return result;
  }



});
