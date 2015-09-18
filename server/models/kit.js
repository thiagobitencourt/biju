var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _validateId = require(__base + 'utils/validateObjectId');

var getTimezonedISODateString = function(){
	console.warn("Use from utils : getTimezonedISODateString");
	var date = new Date();
	//Subtracts the timezone hours to local time.
	date.setHours(date.getHours() - (date.getTimezoneOffset() / 60) );
	return date.toISOString();
}

/*
MODELO: KIT
* Pessoa (allow null)
   * Cidade  (allow null)
* Data da Entrega  (allow null)
* Data do próximo retorno  (allow null)
* Itens [array]
   * Produto
      * Referência
      * Descrição
      * Valor unit
   * Quantidade
   * Valor total produto
* Valor total kit
* Pagamentos [array]
   * Forma Pagamento
   * Data venc.
   * Data receb.
   * Valor
* Valor total pagamento
* Observação
*/

kitSchema = new Schema({
	dataEntrega : {type : Date, default: null},
	dataProxRetorno : {type : Date, default: null},
	itens : [
		{
			produto: {
				_id : {type : Schema.ObjectId, ref:"Produto", required: true},
				referencia : {type : String, required : true}, //valores locais (nao afetam a entidade produto)
				descricao : {type : String, required : true}, //valores locais (nao afetam a entidade produto)
				vlrUnit : {type : Number, required : true} //valores locais (nao afetam a entidade produto)
			},
			quantidade : {type : Number, required : true},
			vlrTotal : {type : Number, required : true},
		}
	],
	vlrTotalKit : {type : Number, required : true}, //somente o sistema pode manipular.
	pagamentos : [
		{
			formaPgto : {type : String, required : true},
			dataVencimento : {type : Date, default: null},
			dataPgto : {type : Date, default: null},
			vlrPgto : {type : Number, required : true, default : 0.0},
		}
	],
	vlrTotalPgto : {type : Number, required : true}, //somente o sistema pode manipular.
	observacao : {type : String},
	deletedAt : { type: Date, default: null} //somente o sistema pode manipular.
});

kitSchema.statics.secureFind = function(kitId, query, cb) {

	if(kitId){
		if(!_validateId.isIdValid(kitId)){
			return cb("Incorrect ID", null);
		}

		this.findOne({_id: kitId, deletedAt: { $eq: null }}, {deletedAt:0}, function(err, kit){
			if(err) return cb(err, null);

			if(!kit)
				return cb("Kit não encontrado", null);

			cb(null, kit);
		});
	}else{
		if(!query)
			query = {};

		query.deletedAt = { $eq: null };

		this.find(query, {deletedAt:0}, function(err, kits){
			if(err) return cb(err, null);
			cb(null, kits);
		});
	}
};

kitSchema.statics.secureDelete = function(kitId, cb) {

	if(!_validateId.isIdValid(kitId)){
		return cb("Incorrect ID", null);
	}

	this.findOneAndUpdate({_id : kitId,  deletedAt: { $eq: null } }, {deletedAt : getTimezonedISODateString()}, {new : true} ,function(err, p){
		if(err)
			return cb({error: err, code: 500, message : "Erro ao atualizar kit."}, null);

		if(!p)
			return cb({message: "Kit não encontrado.", code:400}, null);

		return cb(null, p);
	});
};

kitSchema.statics.secureUpdate = function(kitId, newKit, cb) {

	if(!_validateId.isIdValid(kitId)){
		return cb("Incorrect ID", null);
	}

	this.findOneAndUpdate({_id : kitId,  deletedAt: { $eq: null } }, newKit, {new : true} ,function(err, p){
		if(err)
			return cb({error: err, code: 500, message : "Erro ao atualizar kit."}, null);

		if(!p)
			return cb({message: "Kit não encontrado.", code:400}, null);

		return cb(null, p);
	});
};

Kit = mongoose.model('Kit', kitSchema);

module.exports = Kit;

