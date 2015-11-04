var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var _validateId = require(__base + 'utils/validateObjectId');
var AppError = require(__base + 'utils/apperror');
var logger = require('winston');

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
	"pessoa" : "56014f76721e4c2c146c4df8",
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
	"dataDevolucao" : "09-22-2015"
}
*/

kitSchema = new Schema({
	codigo : {type : Number, required : true, unique : true, appDescription : "Código"},
	codigoPersonalizado : {type : String, required : true, unique : true, appDescription : "Código"},
	pessoa: {type:Schema.ObjectId, ref:"Pessoa", appDescription : "Pessoa"},
	dataEntrega : {type : Date, default: null, appDescription : "Data de Entrega"},
	dataProxRetorno : {type : Date, default: null, appDescription : "Data do Próximo Retorno"},
	itens : [
		{
			produto: {type : Schema.ObjectId, ref:"Produto", required: true, appDescription : "Produto"},
			vlrUnit : {type : Number, required : true, appDescription : "Valor Unitário"},
			qtdeEntregue : {type : Number, required : true, default : 0.0, appDescription : "Quantidade Entregue"},
			qtdeDevolvida : {type : Number, required : true, default : 0.0, appDescription : "Quantidade Devolvida"},
			vlrTotal : {type : Number, required : true, default : 0.0, appDescription : "Valor Total do Item"},
		}
	],
	vlrTotalKit : {type : Number, required : true, default : 0.0, appDescription : "Valor Total do KIT"},
	vlrTotalDivida : {type : Number, required : true, default : 0.0, appDescription : "Valor Total da Dívida"},
	pagamentos : [
		{
			formaPgto : {type : String, required : true, appDescription : "Forma de Pagamento"},
			dataVencimento : {type : Date, default: null, appDescription : "Data de Vencimento"},
			dataPgto : {type : Date, default: null, appDescription : "Data do Pagamento"},
			vlrPgto : {type : Number, required : true, default : 0.0, appDescription : "Valor do Pagamento"},
		}
	],
	vlrTotalPgto : {type : Number, required : true, default : 0.0, appDescription : "Valor Total dos Pagamentos"},
	estado : {type : String, required : true, appDescription : "Estado"},
	observacao : {type : String, appDescription : "Observação"},
	deletedAt : { type: Date, default: null, appDescription : "Removido em"},
	dataGeracao : { type: Date, default: new Date(), required : true, appDescription : "Data da Geração"},
	dataEntrega : { type: Date, default: null, appDescription : "Data da Entrega"},
	dataDevolucao : { type: Date, default: null, appDescription : "Data da Devolução"}
});

kitSchema.statics.secureFind = function(kitId, query, cb) {

	if(kitId){
		if(!_validateId.isIdValid(kitId)){
			return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
		}

		this.findOne({_id: kitId, deletedAt: { $eq: null }}, {deletedAt:0}).populate('itens.produto pessoa').exec( function(err, kit){
			if(err) return cb(new AppError(err, null, null, 'Kit'), null);

			if(!kit)
				return cb(new AppError(null, "Kit não encontrado", AppError.ERRORS.CLIENT), null);

			var k = JSON.parse(JSON.stringify(kit));

			if(k.pessoa)
				k.pessoaId = k.pessoa._id;

			cb(null, k);
		});
	}else{
		if(!query)
			query = {};

		query.deletedAt = { $eq: null };

		this.find(query, {deletedAt:0}).populate('itens.produto pessoa').exec(function(err, kits){
			if(err) return cb(new AppError(err, null, null, 'Kit'), null);

				//TODO fix
				var final_kits = [];

				var index = 0;
				var nestedPessoa = function(){
					if(kits[index]){
						k = JSON.parse(JSON.stringify(kits[index]));
						index++;

						if(k.pessoa){
							k.pessoaId = k.pessoa._id;

							if(k.pessoa.pessoaReferencia){
								var Pessoa = require(__base + 'models/pessoa');
								Pessoa.secureFind(k.pessoa.pessoaReferencia, null, function(err, pessoa){
									if(err) return cb(new AppError(err, null, null, 'Pessoa'), null);

									if(pessoa)
										k.referencia = pessoa.nome;

									final_kits.push(k);
									nestedPessoa();
								});
							}else{
								final_kits.push(k);
								nestedPessoa();
							}
						}else{
							final_kits.push(k);
							nestedPessoa();
						}
					}else{
						cb(null, final_kits);
					}
				}
				nestedPessoa();
			});
	}
};

kitSchema.statics.secureDelete = function(kitId, cb) {

	if(!_validateId.isIdValid(kitId)){
		return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
	}

	this.findOneAndUpdate({_id : kitId,  deletedAt: { $eq: null } }, {deletedAt : getTimezonedISODateString()}, {new : true} ,function(err, p){
		if(err)
			return cb(new AppError(err, null, null, 'Kit'), null);

		if(!p)
			return cb(new AppError(null, "Kit não encontrado.", AppError.ERRORS.CLIENT), null);

		return cb(null, p);
	});
};

kitSchema.statics.secureUpdate = function(kitId, newKit, cb) {

	if(!_validateId.isIdValid(kitId)){
		return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
	}

	this.findOneAndUpdate({_id : kitId,  deletedAt: { $eq: null } }, newKit, {new : true} ,function(err, p){
		if(err)
			return cb(new AppError(err, null, null, 'Kit'), null);

		if(!p)
			return cb(new AppError(null, "Kit não encontrado.", AppError.ERRORS.CLIENT), null);

		return cb(null, p);
	});
};

Kit = mongoose.model('Kit', kitSchema);

module.exports = Kit;
