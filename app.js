var express = require('express');
var mongoose = require('mongoose');
var https = require('https');
var fs = require('fs');
var app = express();

var LoadRouter = require('./server/routes/loadRoutes');

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
  console.log('Example app listening at %s', httpPort);
});

var options = {
  key: fs.readFileSync('config/ssl/biju-key.pem'),
  cert: fs.readFileSync('config/ssl/biju-cert.pem')
};

https.createServer(options, app).listen(httpsPort, function(){
	console.log('Example app listening at port %s', httpsPort);
});
