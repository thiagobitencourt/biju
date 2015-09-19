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
						return callback({error: err, code: 500, message : "Erro ao atualizar pessoa."});

					return callback(null, newPessoa);
				});

			}else{
				//insert
				var p = new _Pessoa(body);
				p.save(function(err, newPessoa){
					if(err)
						return callback({error: err, code: 500, message : "Erro ao salvar pessoa."});

					return callback(null, newPessoa);

				});
			}

		}catch(e){
			console.log(e);
			return callback({error: e, code: 400, message : "Erro ao salvar pessoa."});
		}

	}

	var _removePessoa = function(id, callback){

		try{

			_Pessoa.secureDelete(id, function(err, pessoa){
				if(err)
					return callback({error: err, code: 500, message : "Erro ao remover pessoa."});

				return callback(null, pessoa);
			});

		}catch(e){
			return callback({error: e, code: 400, message : "Erro ao remover pessoa."});
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
						return callback({error: err, code: 500, message : errMessage});

					return callback(null, pessoa);
				});

			}else{
				//find all

				_Pessoa.secureFind(null, query, function(err, pessoas){
					if(err)
						return callback({error: err, code: 500, message : errMessage});

					return callback(null, pessoas);
				});
			}

		}catch(e){
			console.log(e);
			return callback({error: e, code: 500, message : errMessage});
		}	
	}

	return {
		savePessoa: _savePessoa,
		removePessoa: _removePessoa,
		findPessoa: _findPessoa
	}
}();

module.exports = pessoaControler;