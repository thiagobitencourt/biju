var logger = require('winston');
var User = require(__base + 'controller/user');

var LoginRoute = function(app){

	app.post('/login', function(req, res){

		User.login(req.body, function(err, user){
			if(err){
				logger.error(err);
				return res.response(err.error, err.code, err.message);
			}

			req.session.userData = user.clean();
			return res.send(user.clean());
		});
	});

	app.post('/logout', function(req, res){

		if(!req.session || !req.session.userData){
			//Forbidden
			return res.status(403).send({messsage:"Sessão não encontrada"});	
		}

		delete req.session.userData;
		return res.send();
	});

	app.get('/session', function(req, res){

		if(req.session && req.session.userData){
			
			User.getUser(req.session.userData._id, function(err, user){
				if(err){
					logger.error(err);
					return res.response(err.toString(), 500, "Erro ao buscar usuário");
				}

				if(user){
					return res.send(user);
				}else{
					/* Very serios problem, the user shoul be found*/
					logger.info("User not found, and probably it has just logged in");
					return res.response("User not foud", 500, "Erro ao buscar usuário");
				}
			});
		}else{
			//Forbidden
			return res.status(403).send({messsage:"Sessão não encontrada"});	
		}
	});
};

module.exports = LoginRoute;