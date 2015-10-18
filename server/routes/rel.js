var AppError = require(__base + 'utils/apperror');
var responder = require(__base + 'utils/responder');
var RelController = require(__base + 'controller/rel');

var ProdutoRoute = function(router){
	this.router = router;
	setRelRoutes();
}

var setRelRoutes = function(){
  var _rel = "/rel";
  var _relId = _rel + "/:id";

  this.router.get(_relId, function(req, res){

		var query = null;
		// if(req.query && req.query.q){
		// 	query = req.query.q;
		// 	try{
		// 		query = JSON.parse(query);
		// 	}catch(e){
		// 		return responder(res, new AppError(e,'Query parse error', AppError.ERRORS.CLIENT));
		// 		//return res.status(400).send("Query parse error: " +e);
		// 	}
		// }
		// if(!query)
		// 	return responder(res, new AppError(null, 'Missing parameters to build report', AppError.ERRORS.CLIENT));

		RelController.buildRel(req.params.id, query, function(err, relatorio){
			return err ? responder(res, err) : responder(res, relatorio);
		});
	});

};

module.exports = ProdutoRoute;
