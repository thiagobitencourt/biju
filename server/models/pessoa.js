var mongoose = require('mongoose');

var dateFormat = require(__base + 'utils/dateFormat');
var _validateId = require(__base + 'utils/validateObjectId');

var Schema = mongoose.Schema;

//OBJECT EXAMPLE
// {
// 	"nome": "Pessoa Nome",
// 	"cpf": "123.456.789-90",
// 	"rg": "9.858.658-9",
// 	"telefoneFixo": "4566-8595",
// 	"telefoneCelular": "7895-5895",
// 	"endereco": 
// 		{
// 			"pais": "Brasil",
// 			"cidade": "Foz do Iguacu",
// 			"bairro": "Centro",
// 			"rua": "Av Brasil"
// 		},
// 	"email": "pessoa@email.com",
// 	"observacao": "Pessoa teste",
// 	"status": "Ativo"
// }

// var enderecoSchema = new Schema({ 
// 	pais: {type: String, default: "Brasil"},
// 	cidade: String,
// 	cep: String,
// 	bairro: String,
// 	rua: String
// });

pessoaSchema = new Schema({
	nome: { type: String, required: true, index: { unique: true }},
	nascimento: Date,
	cpf: { type: String, unique: true},
	rg: { type: String, unique: true},
	telefoneFixo: {type: String},
	telefoneCelular: {type: String},
	endereco: {
		pais: {type: String, default: "Brasil"},
		cidade: String,
		estado: String,
		cep: String,
		bairro: String,
		rua: String
	},
	email: {type: String},
	pessoaReferencia: {type:Schema.ObjectId, ref:"Pessoa"},
	observacao: {type: String},
	status: { type: String, default: "Ativo"},
	deletedAt: { type: Date, default: null}
});

pessoaSchema.statics.secureFind = function(pessoaId, query, cb) {

	if(pessoaId){
		if(!_validateId.isIdValid(pessoaId)){
			return cb("Incorrect ID", null);
		}

		this.findOne({_id: pessoaId, deletedAt: { $eq: null }}, {deletedAt:0}).populate('pessoaReferencia').exec( function(err, pessoa){
			if(err) return cb(err, null);

			if(!pessoa)
				return cb("Pessoa não encontrada", null);

			cb(null, pessoa);
		});
	}else{
		if(!query)
			query = {};

		query.deletedAt = { $eq: null };

		this.find(query, {deletedAt:0}).populate('pessoaReferencia').exec(function(err, pessoa){
			if(err) return cb(err, null);
			cb(null, pessoa);
		});
	}
};

pessoaSchema.statics.secureDelete = function(pessoaId, cb) {

	if(!_validateId.isIdValid(pessoaId)){
		return cb("Incorrect ID", null);
	}

	this.findOneAndUpdate({_id : pessoaId,  deletedAt: { $eq: null } }, {deletedAt : dateFormat.timeStamp()}, {new : true} ,function(err, p){
		if(err)
			return cb({error: err, code: 500, message : "Erro ao atualizar pessoa."}, null);

		if(!p)
			return cb({message: "Pessoa não encontrada.", code:400}, null);

		return cb(null, p);
	});
};

pessoaSchema.statics.secureUpdate = function(pessoaId, newPessoa, cb) {

	if(!_validateId.isIdValid(pessoaId)){
		return cb("Incorrect ID", null);
	}

	this.findOneAndUpdate({_id : pessoaId,  deletedAt: { $eq: null } }, newPessoa, {new : true} ,function(err, p){
		if(err)
			return cb({error: err, code: 500, message : "Erro ao atualizar pessoa."}, null);

		if(!p)
			return cb({message: "Pessoa não encontrada.", code:400}, null);

		return cb(null, p);
	});
};

Pessoa = mongoose.model('Pessoa', pessoaSchema);

// make this available to our users in our Node applications
module.exports = Pessoa;