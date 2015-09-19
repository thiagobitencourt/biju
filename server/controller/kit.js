var kitController = function(){

	var _Kit = require(__base + 'models/kit');
	var _validateId = require(__base + 'utils/validateObjectId');

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

	var _recalculateKit = function(kit, callback){
		//callback(err, updatedKit);
		try{
			//itens - vlrTotal

			kit.vlrTotalKit = 0.0;
			for(var ivt in kit.itens){
				var item = kit.itens[ivt];

				kit.vlrTotalKit += item.vlrTotal;
			}

			kit.vlrTotalPgto = 0.0;
			for(var ivp in kit.pagamentos){
				var item = kit.pagamentos[ivp];

				kit.vlrTotalPgto += item.vlrPgto;
			}

			return callback(null, kit);


		}catch(e){
			return callback("Error while _recalculateKit : " + e, null);
		}
	}

	var _saveKit = function(body, callback){

		try{
			body.deletedAt = null; //TODO - limpeza manual do campo para evitar que o usuário altere.

			_recalculateKit(body, function(err, newBody){
				if(err)
					return callback({error: err, code: 500, message : "Erro ao recalcular kit."});
				
				if(newBody._id){
					//update

					var id = newBody._id;
					delete newBody._id;

					_Kit.secureUpdate(id, newBody ,function(err, newKit){
						if(err)
							return callback({error: err, code: 500, message : "Erro ao atualizar kit."});

						return callback(null, newKit);
					});

				}else{
					//insert
					var p = new _Kit(newBody);
					p.save(function(err, newKit){
						if(err)
							return callback({error: err, code: 500, message : "Erro ao salvar kit."});

						return callback(null, newKit);

					});
				}
			});
			

		}catch(e){
			return callback({error: e, code: 400, message : "Erro ao salvar kit."});
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