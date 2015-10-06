global.__base = __dirname + '/server/';


var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var https = require('https');
var http = require('http');
var fs = require('fs');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var LoggingSystem = require(__base + 'utils/log');
var logger = require('winston');
var args = process.argv;

mongoose.connect('mongodb://localhost/biju', null, function(err){

	if(err)
		return console.error("DB error : " + err);

	var logDebug = false;
	if(args.indexOf('--debug') > -1)
		logDebug = true;
	var loggingErrors = LoggingSystem.configure(logDebug);
	if(loggingErrors){
		return console.error(loggingErrors);
	}
	logger.info("Logger online.");

	var LoadRouter = require(__base + 'routes/loadRoutes');

	var app = express();

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	app.use(session({
		secret: 'migué por polegada quadrada',
		saveUninitialized: true, // don't create session until something stored
    	resave: false, //don't save session if unmodified
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
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

	// Redirect any connection on http to https (secure)
	app.use('*', function(req, res, next){
		if(!req.secure){
			var host = req.headers.host.split(':')[0];
			//TODO On production, remove the :8143 port. Should be 443 (native)
			return res.redirect('https://' + host + ':8143' +req.url);
		}
		next();
	});

	var isLoggedIn = function(req, res, next){

		if(req.session && req.session.userData){
			logger.debug("isLoggedIn");
			return next();
		}
		logger.debug("NOT LoggedIn");
		//return res.redirect('/login');
		next();
	}

	app.get('/', isLoggedIn);

	app.use(express.static('web/'));

	app.use('/api', new LoadRouter());


//TODO - replace this -- Didn't work
	var server = app.listen(httpPort, function () {
	  logger.info('App listening at %s', httpPort);
	});
//TODO - by this
	// http.createServer(function(req, res){
	// 	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url});
 // 		res.end();
	// }).listen(httpPort, function(){
	// 	logger.info("HTTP server listening on port %s", httpPort);
	// });
//TODO - end.

	var httpsOptions = {
	  key: fs.readFileSync('config/ssl/biju-key.pem'),
	  cert: fs.readFileSync('config/ssl/biju-cert.pem')
	};

	https.createServer(httpsOptions, app).listen(httpsPort, function(){
		logger.info('HTTPS server listening on port %s', httpsPort);
	});
});
