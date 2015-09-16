var express = require('express');

var router;

var PessoaRoute = function(router){

	this.router = router;

	setPessoaRoutes();

	return;
}

var setPessoaRoutes = function(){

	var _pessoa = '/pessoa';
	var _pessoaId = _pessoa + '/:id';
	
	this.router.get(_pessoa, function(req, res){
		var message = 'GET in ' + _pessoa + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});

	this.router.get(_pessoaId, function(req, res){
		var message = 'GET in ' + _pessoaId + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});

	this.router.post(_pessoa, function(req, res){
		var message = 'POST in ' + _pessoa + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});

	this.router.put(_pessoaId, function(req, res){
		var message = 'PUT in ' + _pessoaId + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});

	this.router.delete(_pessoaId, function(req, res){
		var message = 'DELETE in ' + _pessoaId + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});
}

module.exports = PessoaRoute;