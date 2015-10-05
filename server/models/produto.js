var mongoose = require('mongoose');
var AppError = require(__base + 'utils/apperror');
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
	/*os campos description serão ignorados pelo mongoose.*/
  	referencia: { type: String, required: true, unique: true, appDescription : "Referência"},
  	descricao: { type: String, appDescription : "Descrição"},
  	tipo: { type: String, required: true, appDescription : "Tipo"},
  	tamanho: { type: String, appDescription : "Tamanho"},
  	vlrCusto: { type: String, required : true, appDescription : "Valor de Custo"},
  	vlrVenda: { type: String, required : true, appDescription : "Valor de Venda"},
  	observacao: { type: String, appDescription : "Observação"},
  	deletedAt: { type: Date, default: null, appDescription : "Removido em"}
});

produtoSchema.index({referencia: 1, deletedAt: 1}, {unique: true}); //composed unique.

produtoSchema.statics.secureFind = function(produtoId, query, cb) {

	if(produtoId){
		if(!_validateId.isIdValid(produtoId)){
			return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
		}

		this.findOne({_id: produtoId, deletedAt: { $eq: null }}, {deletedAt:0}, function(err, produto){
			if(err) return cb(new AppError(err), null);

			if(!produto)
				return cb("Produto não encontrado", null);

			cb(null, produto);
		});
	}else{

		query.deletedAt = {$eq: null};

		this.find(query, {deletedAt:0}, function(err, produtos){
			if(err) return cb(new AppError(err), null);
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
			return cb(new AppError(err), null);

		if(!p)
			return cb(new AppError(null, "Produto não encontrado.", AppError.ERRORS.CLIENT), null);

		return cb(null, p);
	});
};

produtoSchema.statics.secureUpdate = function(produtoId, newProduto, cb) {

	if(!_validateId.isIdValid(produtoId)){
		return cb("Incorrect ID", null);
	}

	this.findOneAndUpdate({_id : produtoId,  deletedAt: { $eq: null } }, newProduto, {new : true} ,function(err, p){
		if(err)
			return cb(new AppError(err), null);

		if(!p)
			return cb(new AppError(null, "Produto não encontrado.", AppError.ERRORS.CLIENT), null);

		return cb(null, p);
	});
};

Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;
