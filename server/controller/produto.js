var AppError = require(__base + 'utils/apperror');
var logger = require('winston');

var produtoController = function(){

	var _Produto = require(__base + 'models/produto');
	var _validateId = require(__base + 'utils/validateObjectId');

	//errObj = {error: {}, code: 000, message: '' }

	var _findProduto = function(id, query, callback){

		try{
			if(!query)
				query = {};

			if(id){
				//find by id

				_Produto.secureFind(id, null, function(err, produto){
					if(err)
						return callback(err);

					return callback(null, produto);
				});

			}else{
				//find all

				_Produto.secureFind(null, query, function(err, produtos){
					if(err)
						return callback(err);

					return callback(null, produtos);
				});
			}

		}catch(e){
			return callback(new AppError(e, "Unknown error while finding product."));
		}

	}

	var _saveProduto = function(body, callback){

		try{
			body.deletedAt = null; //TODO - limpeza manual do campo para evitar que o usuário altere.

			if(body._id){
				//update

				var id = body._id;
				delete body._id;

				_Produto.secureUpdate(id, body ,function(err, newProduto){
					if(err)
						return callback(err);

					return callback(null, newProduto);
				});

			}else{
				//insert

				var p = new _Produto(body);
				p.save(function(err, newProduto){
					if(err)
						return callback(new AppError(err, null, null, "Produto"));

					return callback(null, newProduto);

				});
			}

		}catch(e){
			return callback(new AppError(e, "Unknown error while saving product."));
		}

	}

	var _removeProduto = function(id, callback){

		try{

			_Produto.secureDelete(id, function(err, produto){
				if(err)
					return callback(err);

				return callback(null, produto);
			});

		}catch(e){
			return callback(new AppError(e, null, null, 'User'));
		}

	}

	return {
		findProduto : _findProduto,
		saveProduto : _saveProduto,
		removeProduto : _removeProduto
	}

}();

module.exports = produtoController;
