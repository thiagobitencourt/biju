var express = require('express');
var AppError = require(__base + 'utils/apperror');
var responder = require(__base + 'utils/responder');

var router;

var PessoaController = require(__base + 'controller/pessoa');

var PessoaRoute = function(router){

	this.router = router;

	setPessoaRoutes();

	return;
}

var setPessoaRoutes = function(){

	var _pessoa = '/pessoa';
	var _pessoaId = _pessoa + '/:id';

	this.router.get(_pessoa, function(req, res){
		var query = null;
		if(req.query && req.query.q){
			query = req.query.q;
			try{
				query = JSON.parse(query);
			}catch(e){
				return responser(res, new AppError(e, "Query parse error", AppError.ERRORS.CLIENT));
			}
		}
		if(!query)
			query = {};

		PessoaController.findPessoa(null, query, function(err, pessoa){
			if(err) return responder(res,err);

			responder(res,pessoa);
		});
	});

	this.router.get(_pessoaId, function(req, res){
		PessoaController.findPessoa(req.params.id, null, function(err, pessoas){
			if(err) return responder(res,err);

			responder(res,pessoas);
		});
	});

	this.router.post(_pessoa, function(req, res){
		if(req.body._id)
			return responder(res, new AppError(null,"Anti-pattern POST: body contains _id", AppError.ERRORS.CLIENT));

		PessoaController.savePessoa(req.body, function(err, pessoa){
			if(err) return responder(res,err);

			responder(res,pessoa);
		});
	});

	this.router.put(_pessoaId, function(req, res){
		if(req.params.id != req.body._id)
			return responder(res, new AppError(null, "Anti-pattern PUT: params id is different of body id.", AppError.ERROR.CLIENT));

		PessoaController.savePessoa(req.body, function(err, pessoa){
			if(err) return responder(res,err);

			responder(res,pessoa);
		});
	});

	this.router.delete(_pessoaId, function(req, res){
		PessoaController.removePessoa(req.params.id, function(err, pessoa){
			if(err) return responder(res,err);

			responder(res,pessoa);
		});
	});
}

module.exports = PessoaRoute;
