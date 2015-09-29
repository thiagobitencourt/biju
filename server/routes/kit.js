var express = require('express');

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
				return res.status(400).send("Query parse error: " +e);
			}
		}
		if(!query)
			query = {};

		KitController.findKit(null, query, function(err, kits){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(kits);
		});
	});

	this.router.get(_kitId, function(req, res){
		KitController.findKit(req.params.id, null, function(err, kit){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(kit);
		});
	});

	this.router.post(_kit, function(req, res){

		if(req.body._id)
			return res.response(null, 400, "Anti-pattern POST: body contains _id");

		KitController.saveKit(req.body, function(err, kit){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(kit);
		});
	});

	this.router.put(_kitId, function(req, res){

		if(req.params.id != req.body._id)
			return res.response(null, 400, "Anti-pattern PUT: params id is different of body id.");

		KitController.saveKit(req.body, function(err, kit){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(kit);
		});
	});

	this.router.delete(_kitId, function(req, res){

		KitController.removeKit(req.params.id, function(err, kit){
			if(err) return res.response(err.error, err.code, err.message);

			res.send(kit);
		});
	});
}

module.exports = KitRoute;