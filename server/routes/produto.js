var express = require('express');

var ProdutoController = require(__base + 'controller/produto');
var AppError = require(__base + 'utils/apperror');
var responder = require(__base + 'utils/responder');

var ProdutoRoute = function(router){

	this.router = router;

	setProdutoRoutes();

	return;
}

var setProdutoRoutes = function(){

	var _produto = "/produto";
	var _produtoId = _produto + "/:id";

	this.router.get(_produto, function(req, res){

		var query = null;
		if(req.query && req.query.q){
			query = req.query.q;
			try{
				query = JSON.parse(query);
			}catch(e){
				return responder(res, new AppError(e,'Query parse error', AppError.ERRORS.CLIENT));
				//return res.status(400).send("Query parse error: " +e);
			}
		}
		if(!query)
			query = {};

		ProdutoController.findProduto(null, query, function(err, produtos){
			// if(err) return res.response(err.error, err.code, err.message);
			//
			// res.send(produtos);
			return err ? responder(res, err) : responder(res, produtos);
		});
	});

	this.router.get(_produtoId, function(req, res){
		ProdutoController.findProduto(req.params.id, null, function(err, produto){
			// if(err) return res.response(err.error, err.code, err.message);
			//
			// res.send(produto);

			return err ? responder(res, err) : responder(res, produto);
		});
	});

	this.router.post(_produto, function(req, res){

		if(req.body._id)
			// return res.response(null, 400, "Anti-pattern POST: body contains _id");
			return responder(res, new AppError(null, "Anti-pattern POST: body contains _id", AppError.ERRORS.CLIENT));

		ProdutoController.saveProduto(req.body, function(err, produto){
			// if(err) return res.response(err.error, err.code, err.message);
			//
			// res.send(produto);
			return err ? responder(res, err) : responder(res, produto);
		});
	});

	this.router.put(_produtoId, function(req, res){

		if(req.params.id != req.body._id)
			//return res.response(null, 400, "Anti-pattern PUT: params id is different of body id.");
			return responder(res, new AppError(null, "Anti-pattern PUT: params id is different of body id.", AppError.ERRORS.CLIENT));


		ProdutoController.saveProduto(req.body, function(err, produto){
			// if(err) return res.response(err.error, err.code, err.message);
			//
			// res.send(produto);

			return err ? responder(res, err) : responder(res, produto);
		});
	});

	this.router.delete(_produtoId, function(req, res){

		ProdutoController.removeProduto(req.params.id, function(err, produto){
			// if(err) return res.response(err.error, err.code, err.message);
			//
			// res.send(produto);

			return err ? responder(res, err) : responder(res, produto);
		});
	});
}

module.exports = ProdutoRoute;
