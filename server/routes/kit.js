var express = require('express');
var AppError = require(__base + 'utils/apperror');
var responder = require(__base + 'utils/responder');

var router; //TODO ?

var KitController = require(__base + 'controller/kit');

var KitRoute = function(router){

	this.router = router;

	setKitRoutes();

	return;
}

var setKitRoutes = function(){

	var _kit = "/kit";
	var _kitId = _kit + "/:id";

	this.router.get(_kit, function(req, res){

		var query = null;
		if(req.query && req.query.q){
			query = req.query.q;
			try{
				query = JSON.parse(query);
			}catch(e){
				return responder(res, new AppError(e, "Query parse error", AppError.ERRORS.CLIENT));
			}
		}
		if(!query)
			query = {};

		KitController.findKit(null, query, function(err, kits){
			if(err) return responder(res,err);

			responder(res,kits);
		});
	});

	this.router.get(_kitId, function(req, res){
		KitController.findKit(req.params.id, null, function(err, kit){
			if(err) return responder(res,err);

			responder(res,kit);
		});
	});

	this.router.post(_kit, function(req, res){

		if(req.body._id)
			return responder(res, new AppError(null, "Anti-pattern POST: body contains _id", AppError.ERRORS.CLIENT));

		KitController.saveKit(req.body, function(err, kit){
			if(err) return responder(res,err);

			responder(res,kit);
		});
	});

	this.router.put(_kitId, function(req, res){

		if(req.params.id != req.body._id)
			return responder(res, new AppError(null, "Anti-pattern POST: body contains _id", AppError.ERRORS.CLIENT));

		KitController.saveKit(req.body, function(err, kit){
			if(err) return responder(res,err);

			responder(res,kit);
		});
	});

	this.router.delete(_kitId, function(req, res){

		KitController.removeKit(req.params.id, function(err, kit){
			if(err) return responder(res,err);

			responder(res,kit);
		});
	});
}

module.exports = KitRoute;
