global.__base = __dirname + '/server/';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var https = require('https');
var fs = require('fs');

var LoadRouter = require(__base + 'routes/loadRoutes');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// mongoose.connect('mongodb://localhost/validate_server');

var httpPort = 8180;
var httpsPort = 8143;

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
