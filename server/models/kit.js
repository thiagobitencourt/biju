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
   * Quantidade Entregue
   * Quantidade Devolvida
   * Valor total produto
* Valor total kit
* Valor total da dívida
* Pagamentos [array]
   * Forma Pagamento
   * Data venc.
   * Data receb.
   * Valor
* Valor total pagamento
* Estado
* Observação
*/

/*
{
	"dataEntrega" : "09-22-2015",
	"dataProxRetorno" : "10-22-2015",
	"itens" : [
		{
			"produto": "56014f76721e4c2c146c4df8",
			"vlrUnit" : 43.09,
			"qtdeEntregue" : 20,
			"qtdeDevolvida" : 0,
			"vlrTotal" : 861.8
		},
		{
			"produto": "56014f97721e4c2c146c4df9",
			"vlrUnit" : 12.3,
			"qtdeEntregue" : 25,
			"qtdeDevolvida" : 10,
			"vlrTotal" : 307.5
		}
	],
	"vlrTotalKit" : 1169.3,
	"vlrTotalDivida" : 123.0,
	"pagamentos" : [
		{
			"formaPgto" : "Nota promissória",
			"dataVencimento" : "11-22-2015",
			"dataPgto" : "11-22-2015",
			"vlrPgto" : 30.00
		},
		{
			"formaPgto" : "Nota promissória",
			"dataVencimento" : "09-22-2015",
			"dataPgto" : "09-22-2015",
			"vlrPgto" : 10.00
		},
		{
			"formaPgto" : "Nota promissória",
			"dataVencimento" : "09-22-2015",
			"dataPgto" : null,
			"vlrPgto" : 60.00
		},
		{
			"formaPgto" : "Nota promissória",
			"dataVencimento" : "09-22-2015",
			"dataPgto" : null,
			"vlrPgto" : 23.00
		}
	],
	"vlrTotalPgto" : 40.00,
	"estado" : "Dívida Pendente",
	"observacao" : "Num sei",
	"deletedAt" : null
}
*/

kitSchema = new Schema({
	codigo : {type : Number, required : true, unique : true},
	dataEntrega : {type : Date, default: null},
	dataProxRetorno : {type : Date, default: null},
	itens : [
		{
			produto: {type : Schema.ObjectId, ref:"Produto", required: true},
			vlrUnit : {type : Number, required : true},
			qtdeEntregue : {type : Number, required : true, default : 0.0},
			qtdeDevolvida : {type : Number, required : true, default : 0.0},
			vlrTotal : {type : Number, required : true, default : 0.0},
		}
	],
	vlrTotalKit : {type : Number, required : true, default : 0.0},
	vlrTotalDivida : {type : Number, required : true, default : 0.0},
	pagamentos : [
		{
			formaPgto : {type : String, required : true},
			dataVencimento : {type : Date, default: null},
			dataPgto : {type : Date, default: null},
			vlrPgto : {type : Number, required : true, default : 0.0},
		}
	],
	vlrTotalPgto : {type : Number, required : true, default : 0.0},
	estado : {type : String, required : true},
	observacao : {type : String},
	deletedAt : { type: Date, default: null}
});

kitSchema.statics.secureFind = function(kitId, query, cb) {

	if(kitId){
		if(!_validateId.isIdValid(kitId)){
			return cb("Incorrect ID", null);
		}

		this.findOne({_id: kitId, deletedAt: { $eq: null }}, {deletedAt:0}).populate('itens.produto').exec( function(err, kit){
			if(err) return cb(err, null);

			if(!kit)
				return cb("Kit não encontrado", null);

			cb(null, kit);
		});
	}else{
		if(!query)
			query = {};

		query.deletedAt = { $eq: null };

		this.find(query, {deletedAt:0}).populate('itens.produto').exec( function(err, kits){
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

