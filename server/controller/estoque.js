var logger = require('winston');

var estoqueController = function(){

	var _Estoque = require(__base + 'models/estoque');
	var _validateId = require(__base + 'utils/validateObjectId');

	//errObj = {error: {}, code: 000, message: '' }

	var _findEstoque = function(id, query, callback){

		try{
			if(!query)
				query = {};

			if(id){
				//find by id

				_Estoque.secureFind(id, null, function(err, estoque){
					if(err)
						return callback({error: err, code: 500, message : "Erro ao procurar estoque."});

					return callback(null, estoque);
				});

			}else{
				//find all

				_Estoque.secureFind(null, query, function(err, estoques){
					if(err)
						return callback({error: err, code: 500, message : "Erro ao procurar estoque."});

					return callback(null, estoques);
				});
			}

		}catch(e){
			return callback({error: e, code: 500, message : "Erro ao salvar estoque."});
		}	

	}

	var _saveEstoque = function(body, callback){

		try{
			body.deletedAt = null; //TODO - limpeza manual do campo para evitar que o usuário altere.

			if(body._id){
				//update

				var id = body._id;
				delete body._id;

				_Estoque.secureUpdate(id, body ,function(err, newEstoque){
					if(err)
						return callback({error: err, code: 500, message : "Erro ao atualizar estoque."});

					return callback(null, newEstoque);
				});

			}else{

				var ProdutoCtrl = require(__base + 'controller/produto');

				ProdutoCtrl.findProduto(null, {referencia: body.produto.referencia}, function(err, prod){
					if(err){
						logger.error(err);
						return callback(err);
					}

					if(prod.length !== 0){

						//TEMP CODE... Need improvement
						var prod = prod[0];
						body.produto = prod._id;

						body.valor = prod.vlrCusto;
						body.valorTotal = (prod.vlrCusto * body.quantidade);

						//insert
						var p = new _Estoque(body);
						p.save(function(err, newEstoque){
							if(err)
								return callback({error: err, code: 500, message : "Erro ao salvar estoque."});

							return callback(null, newEstoque);

						});

					}else{
						return callback({error: "Produto não encontrado", code: 400, message : "Produto não encontrado"});
					}

				});
			}

		}catch(e){
			return callback({error: e, code: 400, message : "Erro ao salvar estoque."});
		}

	}

	var _removeEstoque = function(id, callback){

		try{

			_Estoque.secureDelete(id, function(err, estoque){
				if(err)
					return callback({error: err, code: 500, message : "Erro ao remover estoque."});

				return callback(null, estoque);
			});

		}catch(e){
			return callback({error: e, code: 400, message : "Erro ao remover estoque."});
		}

	}

	return {
		findEstoque : _findEstoque,
		saveEstoque : _saveEstoque,
		removeEstoque : _removeEstoque
	}

}();

module.exports = estoqueController;