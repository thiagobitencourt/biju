var logger = require('winston');
var AppError = require(__base + 'utils/apperror');
var _Counter = require(__base + 'models/counter');

var pessoaControler = function(){

	var _Pessoa = require(__base + 'models/pessoa');

	var _savePessoa = function(body, callback){

		try{
			if(body._id){
				//update

				var id = body._id;
				delete body._id;

				_Pessoa.secureUpdate(id, body ,function(err, newPessoa){
					if(err)
						return callback(err);

					return callback(null, newPessoa);
				});

			}else{
				//insert
				delete body.codigo;
				var p = new _Pessoa(body);
				_Counter.increment('Pessoa', function (err, result) {
					if (err)
						return cb(err);

					p.codigo = result.next;
					p.save(function(err, newPessoa){
						if(err)
							return callback(new AppError(err, null, null, 'Pessoa'));

						return callback(null, newPessoa);
					});
				});
			}

		}catch(e){
			logger.error(e);
			return callback(new AppError(e, null, null, 'Pessoa'));
		}

	}

	var _removePessoa = function(id, callback){

		try{

			_Pessoa.secureDelete(id, function(err, pessoa){
				if(err)
					return callback(err);

				return callback(null, pessoa);
			});

		}catch(e){
			return callback(new AppError(e, null, null, 'Pessoa'));
		}
	}

	var _findPessoa = function(id, query, callback){

		var errMessage = "Erro ao procurar pessoa.";

		try{
			if(!query)
				query = {};

			if(id){
				//find by id

				_Pessoa.secureFind(id, null, function(err, pessoa){
					if(err)
						return callback(err);

					return callback(null, pessoa);
				});

			}else{
				//find all

				_Pessoa.secureFind(null, query, function(err, pessoas){
					if(err)
						return callback(err);

					return callback(null, pessoas);
				});
			}

		}catch(e){
			logger.error(e);
			return callback(new AppError(e, null, null, 'Pessoa'));
		}
	}

	return {
		savePessoa: _savePessoa,
		removePessoa: _removePessoa,
		findPessoa: _findPessoa
	}
}();

module.exports = pessoaControler;
