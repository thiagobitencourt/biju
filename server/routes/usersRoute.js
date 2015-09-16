var express = require('express');

var router;

var UserRoute = function(router){

	this.router = router;

	setUserRoutes();

	return;
}

var setUserRoutes = function(){
	var _user = '/user';
	var _userId = _user + '/:id';
	
	this.router.get(_user, function(req, res){
		var message = 'GET in ' + _user + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});

	this.router.get(_userId, function(req, res){
		var message = 'GET in ' + _userId + ' route';
		console.log(message);
		return res.response(null, 200, message);

	});

	this.router.post(_user, function(req, res){
		var message = 'POST in ' + _user + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});

	this.router.put(_userId, function(req, res){
		var message = 'PUT in ' + _userId + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});

	this.router.delete(_userId, function(req, res){
		var message = 'DELETE in ' + _userId + ' route';
		console.log(message);
		return res.response(null, 200, message);
	});
}

module.exports = UserRoute;
