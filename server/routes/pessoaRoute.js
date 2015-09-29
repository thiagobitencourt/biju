var express = require('express');

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
				return res.status(400).send("Query parse error: " +e);
			}
		}
		if(!query)
			query = {};

		PessoaController.findPessoa(null, query, function(err, pessoa){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(pessoa);
		});
	});

	this.router.get(_pessoaId, function(req, res){
		PessoaController.findPessoa(req.params.id, null, function(err, pessoas){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(pessoas);
		});
	});

	this.router.post(_pessoa, function(req, res){
		if(req.body._id)
			return res.response(null, 400, "Anti-pattern POST: body contains _id");

		PessoaController.savePessoa(req.body, function(err, pessoa){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(pessoa);
		});
	});

	this.router.put(_pessoaId, function(req, res){
		if(req.params.id != req.body._id)
			return res.response(null, 400, "Anti-pattern PUT: params id is different of body id.");

		PessoaController.savePessoa(req.body, function(err, pessoa){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(pessoa);
		});
	});

	this.router.delete(_pessoaId, function(req, res){
		PessoaController.removePessoa(req.params.id, function(err, pessoa){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(pessoa);
		});
	});
}

module.exports = PessoaRoute;