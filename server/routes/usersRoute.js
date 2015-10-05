var express = require('express');
var mongoose = require('mongoose');
var AppError = require(__base + 'utils/apperror');
var responder = require(__base + 'utils/responder');

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

		if(!req.session.userData){

			UserCtrl.login(req.body.username, req.body.password, function(err, userData){
				if(err) return responder(res, err);

				if(userData){
					req.session.userData = userData;
					return responder(res, userData);
				}else{
					return res.responder(res, new AppError(null, "Usuário inválido", AppError.ERRORS.CLIENT));
				}
			});

		}else{
			return responder(res, req.session.userData);
		}
	});

	this.router.post('/logout', function(req, res){

		try{
			req.session.destroy(function(err){
				if(err)
					return responder(res, new AppError(err, "Error while trying to destroy the session"));

				responder(res,"Bye");
			});
		}catch(e){
			return responder(res, new AppError(e, "Error on route /logout", AppError.ERRORS.CLIENT));
		}

	});
}

var setUserRoutes = function(){
	var _user = '/user';
	var _userId = _user + '/:id';

	var User = require(__base + 'models/users');

	this.router.get(_user, function(req, res){

		UserCtrl.getUser(null, function(err, users){
			if(err) return responder(res, err);

			responder(res, users);
		});

		// User.find({}, function(err, users){
		// 	if(err) return responder(err, 500, "Error on find user");
		// 	return responder(res,users);
		// });
	});

	this.router.get(_userId, function(req, res){
		UserCtrl.getUser(req.params.id, function(err, user){
			if(err) return responder(res, err);

			responder(res, user);
		});
	});

	this.router.post(_user, function(req, res){
		UserCtrl.newUser(req.body, function(err, user){
			if(err) return responder(res, err);
			return responder(res,user);
		});
	});

	this.router.put(_userId, function(req, res){
		UserCtrl.updateUser(req.params.id, req.body, function(err, newUser){
			if(err) return responder(res, err);
			responder(res,newUser);
		});
	});

	this.router.delete(_userId, function(req, res){
		UserCtrl.removeUser(req.params.id, function(err, removedUser){
			if(err) return responder(res, err);

			responder(res,removedUser);
		});
	});
}

module.exports = UserRoute;
