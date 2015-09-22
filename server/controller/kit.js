var kitController = function(){

	var _Kit = require(__base + 'models/kit');
	var _validateId = require(__base + 'utils/validateObjectId');
	var _Counter = require(__base + 'models/counter');

	//errObj = {error: {}, code: 000, message: '' }

	var _findKit = function(id, query, callback){

		try{
			if(!query)
				query = {};

			if(id){
				//find by id

				_Kit.secureFind(id, null, function(err, kit){
					if(err)
						return callback({error: err, code: 500, message : "Erro ao procurar kit."});

					return callback(null, kit);
				});

			}else{
				//find all

				_Kit.secureFind(null, query, function(err, kits){
					if(err)
						return callback({error: err, code: 500, message : "Erro ao procurar kit."});

					return callback(null, kits);
				});
			}

		}catch(e){
			return callback({error: e, code: 500, message : "Erro ao salvar kit."});
		}	

	}

	var _saveKit = function(body, callback){

		try{
			body.deletedAt = null; //TODO - limpeza manual do campo para evitar que o usuário altere.
				
			if(body._id){
				//update

				var id = body._id;
				delete body._id;
				delete body.codigo;

				_Kit.secureUpdate(id, body ,function(err, newKit){
					if(err)
						return callback({error: err, code: 500, message : "Erro ao atualizar kit."});

					return callback(null, newKit);
				});

			}else{
				//insert
				delete body.codigo;
				var p = new _Kit(body);

				_Counter.increment('Kit', function (err, result) {
					if (err)
						return cb(err);

					p.codigo = result.next;
					p.save(function(err, newKit){
						if(err)
							return callback({error: err, code: 500, message : "Erro ao salvar kit."});

						return callback(null, newKit);
					})					
				});
			}			

		}catch(e){
			return callback({error: e.toString(), code: 400, message : "Erro ao salvar kit."});
		}

	}

	var _removeKit = function(id, callback){

		try{

			_Kit.secureDelete(id, function(err, kit){
				if(err)
					return callback({error: err, code: 500, message : "Erro ao remover kit."});

				return callback(null, kit);
			});

		}catch(e){
			return callback({error: e, code: 400, message : "Erro ao remover kit."});
		}

	}

	return {
		findKit : _findKit,
		saveKit : _saveKit,
		removeKit : _removeKit
	}

}();

module.exports = kitController;