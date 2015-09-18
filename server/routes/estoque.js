var express = require('express');

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
		EstoqueController.findEstoque(null, req.query, function(err, estoques){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(estoques);
		});
	});

	this.router.get(_estoqueId, function(req, res){
		EstoqueController.findEstoque(req.params.id, null, function(err, estoque){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(estoque);
		});
	});

	this.router.post(_estoque, function(req, res){

		if(req.body._id)
			return res.response(null, 400, "Anti-pattern POST: body contains _id");

		EstoqueController.saveEstoque(req.body, function(err, estoque){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(estoque);
		});
	});

	this.router.put(_estoqueId, function(req, res){

		if(req.params.id != req.body._id)
			return res.response(null, 400, "Anti-pattern PUT: params id is different of body id.");

		EstoqueController.saveEstoque(req.body, function(err, estoque){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(estoque);
		});
	});

	this.router.delete(_estoqueId, function(req, res){

		EstoqueController.removeEstoque(req.params.id, function(err, estoque){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(estoque);
		});
	});
}

module.exports = EstoqueRoute;