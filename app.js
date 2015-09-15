var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();

var httpPort = 8180;
var httpsPort = 8143;

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(httpPort, function () {
  console.log('Example app listening at %s', httpPort);
});

/*
How to generate ssl files. On terminal type:
	openssl genrsa -out biju-key.pem 1024
 	openssl req -new -key biju-key.pem -out biju-cert-req.csr
 	openssl x509 -req -in biju-cert-req.csr -signkey biju-key.pem -out biju-cert.pem
*/
var options = {
  key: fs.readFileSync('config/ssl/biju-key.pem'),
  cert: fs.readFileSync('config/ssl/biju-cert.pem')
};

https.createServer(options, app).listen(httpsPort, function(){
	console.log('Example app listening at port %s', httpsPort);
});