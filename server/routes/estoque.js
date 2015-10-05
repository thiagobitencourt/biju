var express = require('express');
var AppError = require(__base + 'utils/apperror');
var responder = require(__base + 'utils/responder');

var router; //TODO ?

var EstoqueController = require(__base + 'controller/estoque');

var EstoqueRoute = function(router){

	this.router = router;

	setEstoqueRoutes();

	return;
}

var setEstoqueRoutes = function(){

	var _estoque = "/estoque";
	var _estoqueId = _estoque + "/:id";

	this.router.get(_estoque, function(req, res){

		var query = null;
		if(req.query && req.query.q){
			query = req.query.q;
			try{
				query = JSON.parse(query);
			}catch(e){
				return responder(res, new AppError(e, "Query parse error", AppError.ERRORS.CLIENT));
			}
		}
		if(!query)
			query = {};

		EstoqueController.findEstoque(null, query, function(err, estoques){
			if(err) return responder(res,err);

			responder(res,estoques);
		});
	});

	this.router.get(_estoqueId, function(req, res){
		EstoqueController.findEstoque(req.params.id, null, function(err, estoque){
			if(err) return responder(res,err);

			responder(res,estoque);
		});
	});

	this.router.post(_estoque, function(req, res){

		if(req.body._id)
			return responder(res, new AppError(null, "Anti-pattern POST: body contains _id", AppError.ERRORS.CLIENT));

		EstoqueController.saveEstoque(req.body, function(err, estoque){
			if(err) return responder(res,err);

			responder(res,estoque);
		});
	});

	this.router.put(_estoqueId, function(req, res){

		if(req.params.id != req.body._id)
			return responder(res, new AppError(null, "Anti-pattern POST: body contains _id", AppError.ERRORS.CLIENT));

		EstoqueController.saveEstoque(req.body, function(err, estoque){
			if(err) return responder(res,err);

			responder(res,estoque);
		});
	});

	this.router.delete(_estoqueId, function(req, res){

		EstoqueController.removeEstoque(req.params.id, function(err, estoque){
			if(err) return responder(res,err);

			responder(res,estoque);
		});
	});
}

module.exports = EstoqueRoute;
