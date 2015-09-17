var express = require('express');

var router; //TODO ?

var ProdutoController = require(__base + 'controller/produto');

var ProdutoRoute = function(router){

	this.router = router;

	setProdutoRoutes();

	return;
}

var setProdutoRoutes = function(){

	var _produto = "/produto";
	var _produtoId = _produto + "/:id"; 

	this.router.get(_produto, function(req, res){
		ProdutoController.findProduto(null, req.query, function(err, produtos){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(produtos);
		});
	});

	this.router.get(_produtoId, function(req, res){
		ProdutoController.findProduto(req.params.id, null, function(err, produto){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(produto);
		});
	});

	this.router.post(_produto, function(req, res){

		if(req.body._id)
			return res.response(null, 400, "Anti-pattern POST: body contains _id");

		ProdutoController.saveProduto(req.body, function(err, produto){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(produto);
		});
	});

	this.router.put(_produtoId, function(req, res){

		if(req.params.id != req.body._id)
			return res.response(null, 400, "Anti-pattern PUT: params id is different of body id.");

		ProdutoController.saveProduto(req.body, function(err, produto){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(produto);
		});
	});

	this.router.delete(_produtoId, function(req, res){

		ProdutoController.removeProduto(req.params.id, function(err, produto){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(produto);
		});
	});
}

module.exports = ProdutoRoute;