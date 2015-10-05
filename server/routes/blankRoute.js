var express = require('express');
var logger = require('winston');
var AppError = require(__base + 'utils/apperror');
var responder = require(__base + 'utils/responder');

var router;

/*
	Classe modelo para criação de rotas.
	1. Substitua Blank pelo nome da classe
	(use Ctrl+d, no sublime, para selecionar todas as aparições de Blank)
		Ex.: Blank troque por Kit

	2. Subtitua _blank pelo nome da rota
		Ex.: _blank por _kit

	3. Subtitua _blankId pelo nome da rota sufixado por Id
		Ex.: _blankId por _kitId
*/

var BlankRoute = function(router){

	this.router = router;

	setBlankRoutes();

	return;
}

var setBlankRoutes = function(){

	var _blank = "/_blank";
	var _blankId = _blank + "/:id";

	this.router.get(_blank, function(req, res){
		var message = 'GET in ' + _blank + ' route';
		logger.debug(message);
		return res.response(null, 200, message);
	});

	this.router.get(_blankId, function(req, res){
		var message = 'GET in ' + _blankId + ' route';
		logger.debug(message);
		return res.response(null, 200, message);
	});

	this.router.post(_blank, function(req, res){
		var message = 'POST in ' + _blank + ' route';
		logger.debug(message);
		return res.response(null, 200, message);
	});

	this.router.put(_blankId, function(req, res){
		var message = 'PUT in ' + _blankId + ' route';
		logger.debug(message);
		return res.response(null, 200, message);
	});

	this.router.delete(_blankId, function(req, res){
		var message = 'DELETE in ' + _blankId + ' route';
		logger.debug(message);
		return res.response(null, 200, message);
	});
}

module.exports = BlankRoute;
