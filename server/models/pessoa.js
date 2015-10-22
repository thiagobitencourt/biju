var mongoose = require('mongoose');

var dateFormat = require(__base + 'utils/dateFormat');
var _validateId = require(__base + 'utils/validateObjectId');
var AppError = require(__base + 'utils/apperror');
var logger = require('winston');

var Schema = mongoose.Schema;

//OBJECT EXAMPLE
/*
{
	"nome": "Pessoa Nome",
	"cpf": "123.456.789-90",
	"rg": "9.858.658-9",
	"telefoneFixo": "4566-8595",
	"telefoneCelular": "7895-5895",
	"endereco":
		{
			"pais": "Brasil",
			"cidade": "Foz do Iguacu",
			"bairro": "Centro",
			"rua": "Av Brasil"
		},
	"email": "pessoa@email.com",
	"observacao": "Pessoa teste",
	"status": "Ativo"
}
*/

// var enderecoSchema = new Schema({
// 	pais: {type: String, default: "Brasil"},
// 	cidade: String,
// 	cep: String,
// 	bairro: String,
// 	rua: String
// });

pessoaSchema = new Schema({
	nome: { type: String, required: true, index: { unique: true }, appDescription : "Nome"},
	nascimento: {type: Date, appDescription : "Nascimento"},
	cpf: { type: String, index: true, unique: true, sparse: true, appDescription : "CPF"},
	rg: { type: String, index: true, unique: true, sparse: true, appDescription : "RG"},
	telefoneFixo: {type: String, appDescription : "Tel. Fixo"},
	telefoneCelular: {type: String, appDescription : "Tel. Celular"},
	endereco: {
		pais: {type: String, default: "Brasil", appDescription : "País"},
		cidade: {type: String, appDescription : "Cidade"},
		estado: {type: String, appDescription : "Estado"},
		cep: {type: String, appDescription : "CEP"},
		bairro: {type: String, appDescription : "Bairro"},
		rua: {type: String, appDescription : "Rua"}
	},
	email: {type: String, appDescription : "E-mail"},
	codigo : {type : Number, required : true, unique : true, appDescription : "Código"},
	pessoaReferencia: {type:Schema.ObjectId, ref:"Pessoa", appDescription : "Pessoa Referência"},
	observacao: {type: String, appDescription : "Observação"},
	status: { type: String, default: "Ativo", appDescription : "Estatus"},
	deletedAt: { type: Date, default: null, appDescription : "Removido em"}
});

pessoaSchema.statics.secureFind = function(pessoaId, query, cb) {

	if(pessoaId){
		if(!_validateId.isIdValid(pessoaId)){
			return cb("Incorrect ID", null);
		}

		this.findOne({_id: pessoaId, deletedAt: { $eq: null }}, {deletedAt:0}).populate('pessoaReferencia').exec( function(err, pessoa){
			if(err) return cb(new AppError(err, null, null, 'Pessoa'), null);

			if(!pessoa)
				return cb("Pessoa não encontrada", null);

			cb(null, pessoa);
		});
	}else{
		if(!query)
			query = {};

		query.deletedAt = { $eq: null };

		this.find(query, {deletedAt:0}).populate('pessoaReferencia').exec(function(err, pessoa){
			if(err) return cb(new AppError(err, null, null, 'Pessoa'), null);
			cb(null, pessoa);
		});
	}
};

pessoaSchema.statics.secureDelete = function(pessoaId, cb) {

	if(!_validateId.isIdValid(pessoaId)){
		return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
	}

	this.findOneAndUpdate({_id : pessoaId,  deletedAt: { $eq: null } }, {deletedAt : dateFormat.timeStamp()}, {new : true} ,function(err, p){
		if(err)
			return cb(new AppError(err, null, null, 'Pessoa'), null);

		if(!p)
			return cb(new AppError(null, "Pessoa não encontrada.", AppError.ERRORS.CLIENT), null);

		return cb(null, p);
	});
};

pessoaSchema.statics.secureUpdate = function(pessoaId, newPessoa, cb) {

	if(!_validateId.isIdValid(pessoaId)){
		return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
	}

	this.findOneAndUpdate({_id : pessoaId,  deletedAt: { $eq: null } }, newPessoa, {new : true} ,function(err, p){
		if(err)
			return cb(new AppError(err, null, null, 'Pessoa'), null);

		if(!p)
			return cb(new AppError(null, "Pessoa não encontrada.", AppError.ERRORS.CLIENT), null);

		return cb(null, p);
	});
};

Pessoa = mongoose.model('Pessoa', pessoaSchema);

// make this available to our users in our Node applications
module.exports = Pessoa;
