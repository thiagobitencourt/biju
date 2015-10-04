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
MODELO: Produto
* Descrição
* Referência
* Tipo
* Tamanho
* Valor de custo
* Valor de venda
* Observação 
*/

/*
{
	"referencia": "321",
	"descricao": "Descricao 1 ",
	"tipo": "Anel",
	"tamanho": "GG ?",
	"vlrCusto": 50.0,
	"vlrVenda": 70.0,
	"observacao": "Observei e nao vi nada",
	"deletedAt": null
}
*/

produtoSchema = new Schema({
  	referencia: { type: String, required: true, unique: true},
  	descricao: { type: String, required: true},
  	tipo: { type: String, required: true},
  	tamanho: { type: String},
  	vlrCusto: { type: String, required : true},
  	vlrVenda: { type: String, required : true},
  	observacao: { type: String},
  	deletedAt: { type: Date, default: null}
});

produtoSchema.index({referencia: 1, deletedAt: 1}, {unique: true}); //composed unique.

produtoSchema.statics.secureFind = function(produtoId, query, cb) {

	if(produtoId){
		if(!_validateId.isIdValid(produtoId)){
			return cb("Incorrect ID", null);
		}

		this.findOne({_id: produtoId, deletedAt: { $eq: null }}, {deletedAt:0}, function(err, produto){
			if(err) return cb(err, null);

			if(!produto)
				return cb("Produto não encontrado", null);

			cb(null, produto);
		});
	}else{

		query.deletedAt = {$eq: null};

		this.find(query, {deletedAt:0}, function(err, produtos){
			if(err) return cb(err, null);
			cb(null, produtos);
		});
	}
};

produtoSchema.statics.secureDelete = function(produtoId, cb) {

	if(!_validateId.isIdValid(produtoId)){
		return cb("Incorrect ID", null);
	}

	this.findOneAndUpdate({_id : produtoId,  deletedAt: { $eq: null } }, {deletedAt : getTimezonedISODateString()}, {new : true} ,function(err, p){
		if(err)
			return cb({error: err, code: 500, message : "Erro ao atualizar produto."}, null);

		if(!p)
			return cb({message: "Produto não encontrado.", code:400}, null);

		return cb(null, p);
	});
};

produtoSchema.statics.secureUpdate = function(produtoId, newProduto, cb) {

	if(!_validateId.isIdValid(produtoId)){
		return cb("Incorrect ID", null);
	}

	this.findOneAndUpdate({_id : produtoId,  deletedAt: { $eq: null } }, newProduto, {new : true} ,function(err, p){
		if(err)
			return cb({error: err, code: 500, message : "Erro ao atualizar produto."}, null);

		if(!p)
			return cb({message: "Produto não encontrado.", code:400}, null);

		return cb(null, p);
	});
};

Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;

