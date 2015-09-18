var express = require('express');
var mongoose = require('mongoose');

var UserCtrl = require(__base + 'controller/user');

var router;

var UserRoute = function(router){

	this.router = router;

	setUserRoutes();
	setLoginRoutes();

	return;
}

var setLoginRoutes = function(){

	this.router.post('/login', function(req, res){

		UserCtrl.login(req.body.username, req.body.password, function(err, session){
			if(err) return res.response(err.error, err.code, err.message);

			if(session){
				req.appSession = session;
				return res.send(session);
			}else{
				return res.response(err.error, err.code, err.message);
			}
		});
	});

	this.router.post('/logout', function(){

	});
}

var setUserRoutes = function(){
	var _user = '/user';
	var _userId = _user + '/:id';

	var User = require(__base + 'models/users');
	
	this.router.get(_user, function(req, res){

		UserCtrl.getUser(null, function(err, users){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(users);
		});

		// User.find({}, function(err, users){
		// 	if(err) return res.response(err, 500, "Error on find user");
		// 	return res.send(users);
		// });
	});

	this.router.get(_userId, function(req, res){
		UserCtrl.getUser(req.params.id, function(err, user){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(user);
		});
	});

	this.router.post(_user, function(req, res){
		UserCtrl.newUser(req.body, function(err, user){
			if(err) return res.response(err.error, err.code, err.message);
			return res.send(user);
		});
	});

	this.router.put(_userId, function(req, res){
		UserCtrl.updateUser(req.params.id, req.body, function(err, newUser){
			if(err) return res.response(err.error, err.code, err.message);
			res.send(newUser);
		});
	});

	this.router.delete(_userId, function(req, res){
		UserCtrl.removeUser(req.params.id, function(err, removedUser){
			if(err) return res.response(err.error, err.code, err.message);
			
			res.send(removedUser);
		});
	});
}

module.exports = UserRoute;
