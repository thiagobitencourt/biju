var AppError = require(__base + 'utils/apperror');
var logger = require('winston');

var RelController = function(){
  /*
    - Dívida atual por pessoa (somente pessoas com dívida).
    !! boto fé que eh soh fazer o de baixo, com uma opção de resumão.
       - Pasta, Responsável, Valor Total Dívida, Valor Pago, Valor Restante
       - Valor total geral de todas as dívidas
       - Valor total geral de valores pagos
       - Valor total geral restante.

    - Dívida atual por kit agrupado por pessoa com dados de pagamento  (somente pessoas com dívida).
      Pasta, Responsável, Data Entrega, Data Fechamento, Valor Total Dívida, Valor Pago, Valor Restante
        - Valor parcela, Data venc, valor recebido, data recebimento.
        - Valor total geral de todas as dívidas
        - Valor total geral de valores pagos
        - Valor total geral restante.

    - Pessoas com kits em mãos 'kits na praça'
      resumo geral
      resumo de cada kit agrupado por pessoa.

    - Kit
      igual o rel de kit do jihad



  */

  var _KitModel = require(__base + 'models/kit');
  var _PessoaModel = require(__base + 'models/pessoa');
  var _KitCtrl = require(__base + 'controller/kit');

  var _relDividaPorKit = function(query, rootCallback){

    /*{
      'vlrTotalDividas' : 0.0,
      'vlrTotalPagos' : 0.0,
      'vlrTotalRestante' : 0.0,
      'registros': [
        {
          'pessoa' : {},
          'vlrTotalDividas' : 0.0,
          'vlrTotalPagos' : 0.0,
          'vlrTotalRestante' : 0.0,
          'kits' : [
            {
              'codigo' : 1,
              'dataEntrega': 1,
              'dataFechamento': 1,
              'vlrTotalDivida': 1,
              'vlrTotalPago': 1,
              'vlrTotalRestante': 1,
              'pagamentos' : [
                'formaPgto' : ,
          			'dataVencimento' : ,
          			'dataPgto' : ,
          			'vlrPgto' :
              ]
            }
          ]
        }
      ]
    }*/
    var finalQuery = {};

    if(query.estado){
      finalQuery.estado = query.estado;
    }
    if(query.pessoaId){
      if(query.pessoaId !== 'todas')
        finalQuery.pessoa = query.pessoaId;
    }

    var report = {};
    report.vlrTotalDividas = 0.0;
    report.vlrTotalPagos = 0.0;
    report.vlrTotalRestante = 0.0;
    report.vlrTotalKits = 0.0;
    report.registros = [];

    var _registrosMap = {};
    _KitModel.find(
      finalQuery,
      {deletedAt:0, itens:0})
      .populate([{path : 'pessoa'}])
      .sort('pessoa.nome')
      .exec(function(err, kits){
        if(err) return rootCallback(new AppError(err, "Impossível gerar relatório devido a erro interno.", AppError.ERRORS.INTERNAL), null);

        for (var kitIndex in kits) {
          var kit = kits[kitIndex];

          // if(kit.pessoa.pessoaReferencia){
          //   (function(){
          //     var _kit = kit;
          //
          //     _PessoaModel.populate(kit.pessoa, {path:'pessoaReferencia'}, function(err,pessoa){
          //       if(err){
          //         logger.error("populate error : " + err.toString());
          //         _kit.pessoa.pessoaReferencia = "Não foi possível buscar esta informação.";
          //         return;
          //       }
          //       console.log('deu');
          //       _kit.pessoa.pessoaReferencia = pessoa;
          //     });
          //   })();
          // }

          // logger.debug(kit.toString());
          if(query.somenteDividaAtiva && kit.vlrTotalPgto >= kit.vlrTotalDivida){
            // esse kit está pago. será ignorado conforme requisitado pela query.
            continue;
          }

          var pessoaGroup = _registrosMap[kit.pessoa._id];
          if(!pessoaGroup){
            _registrosMap[kit.pessoa._id] = {};
            _registrosMap[kit.pessoa._id].pessoa = kit.pessoa;
            _registrosMap[kit.pessoa._id].vlrTotalKits = 0.0;
            _registrosMap[kit.pessoa._id].vlrTotalDividas = 0.0;
            _registrosMap[kit.pessoa._id].vlrTotalPagos = 0.0;
            _registrosMap[kit.pessoa._id].vlrTotalRestante = 0.0;
            _registrosMap[kit.pessoa._id].kits = [];
            pessoaGroup = _registrosMap[kit.pessoa._id];
          }

          // kit.pessoa = undefined;
          kit.__v = undefined;

          pessoaGroup.vlrTotalDividas += kit.vlrTotalDivida;
          pessoaGroup.vlrTotalPagos += kit.vlrTotalPgto;
          pessoaGroup.vlrTotalRestante += kit.vlrTotalDivida - kit.vlrTotalPgto;
          pessoaGroup.vlrTotalKits += kit.vlrTotalKit;

          pessoaGroup.kits.push(kit);

        }

        for (var pessoaIndex in _registrosMap) {
          var pessoaGroup = _registrosMap[pessoaIndex];

          report.vlrTotalDividas += pessoaGroup.vlrTotalDividas;
          report.vlrTotalPagos += pessoaGroup.vlrTotalPagos;
          report.vlrTotalRestante += pessoaGroup.vlrTotalRestante;
          report.vlrTotalKits += pessoaGroup.vlrTotalKits;

          report.registros = report.registros.concat(pessoaGroup);
        }
        rootCallback(null, report);
    });
  };

  var _relKitsNaPraca = function(query, rootCallback){
    //this function will be the rootCallback of _relDividaPorKit;

    _relDividaPorKit(query, function(err, report){

      if(err)
        return rootCallback(err);

      _PessoaModel.secureFind(null, {}, function(err, pessoas){
        if(err)
          return rootCallback(new AppError(err, "Impossível gerar relatório devido a erro interno.", AppError.ERRORS.INTERNAL));

          var pessoasMap = {};
          for(var i in pessoas){
            var pessoa = pessoas[i];
            pessoasMap[pessoa._id] = pessoa;
          }


          for(var i in report.registros){
            var registro = report.registros[i];
            for(var j in registro.kits){
              var kit = registro.kits[j];
              if(kit.pessoa.pessoaReferencia){
                kit.pessoa.pessoaReferencia = pessoasMap[kit.pessoa.pessoaReferencia];
              }
            }
          }

        return rootCallback(null, report);
      });

    });

  };

  var _buildRel = function(relId, query, callback){
    switch (relId) {
      case 'relDividaPorKit':
        var result = _relDividaPorKit(query, callback);
        // callback(result.err, result.report);
        break;
      case 'relKitsNaPraca':
        var result = _relKitsNaPraca(query, callback);
        break;
      default:
        callback(new AppError(null, "Unknown relId", AppError.ERRORS.CLIENT), null);
    }
  }

  return {
    buildRel : _buildRel
  };
}();

module.exports = RelController;
