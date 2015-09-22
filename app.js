global.__base = __dirname + '/server/';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var https = require('https');
var fs = require('fs');
var session = require('express-session');

mongoose.connect('mongodb://localhost/biju', null, function(err){

	if(err)
		return console.error("DB error : " + err);

	var LoadRouter = require(__base + 'routes/loadRoutes');

	var app = express();

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	app.use(session({
		secret: 'migué por polegada quadrada',
		resave: false,
		saveUninitialized: true,
		cookie: { 
			secure: true,
			maxAge: 60000 //60seg
		}
	}))	

	var httpPort = 8180;
	var httpsPort = 8143;

	//Necessary headers to clients access.
	app.all('*', function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Credentials', 'true');
		res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	app.all('*', function(req, res, next){
		res.response = function(error, responseStatus, message){
			var sendMessage = {message: message, status: responseStatus};
			if(error){
				sendMessage.error = error;
			}
			return res.status(responseStatus).send(sendMessage);
		};
		next();
	});

	var isLoggedIn = function(req, res, next){

		if(req.session && req.session.userData){
			console.log("isLoggedIn");
			return next();
		}
		console.log("NOT LoggedIn");
		//return res.redirect('/login');
		next();
	}

	app.get('/', isLoggedIn);

	app.use(express.static('web/'));

	app.use('/api', new LoadRouter());

	var server = app.listen(httpPort, function () {
	  console.log('App listening at %s', httpPort);
	});

	var options = {
	  key: fs.readFileSync('config/ssl/biju-key.pem'),
	  cert: fs.readFileSync('config/ssl/biju-cert.pem')
	};

	https.createServer(options, app).listen(httpsPort, function(){
		console.log('App listening at port %s', httpsPort);
	});
});


