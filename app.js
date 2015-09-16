var express = require('express');
var mongoose = require('mongoose');
var https = require('https');
var fs = require('fs');
var app = express();

mongoose.connect('mongodb://localhost/validate_server');

var kittySchema = mongoose.Schema({
    name: String
});

var Kitten = mongoose.model('Kitten', kittySchema);

var httpPort = 8180;
var httpsPort = 8143;

app.get('/', function (req, res) {
	var fluffy = new Kitten({ name: 'fluffy' });
	fluffy.save(function (err, fluffy) {
	  if (err) return console.error(err);
	  res.send("Hello World OK! ID do obj salvo no banco: " + fluffy._id);
	});
});

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


