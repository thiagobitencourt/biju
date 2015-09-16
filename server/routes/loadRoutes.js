var express = require('express');

var UserRoute = require('./usersRoute');
var PessoaRoute = require('./pessoaRoute');

var BlankRoute = require('./blankRoute');

var LoadRoutes = function(){

	router = express.Router();

	//User BlankRoute como base para construir novas classes de rotas.
	new BlankRoute(router);

	new UserRoute(router);
	new PessoaRoute(router);

	return router;
}

module.exports = LoadRoutes;