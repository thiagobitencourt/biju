var winston = require('winston');
var util = require('util');
var LogModel = require(__base +'models/log');
var DateFormat = require(__base + 'utils/dateFormat');

var Log = function(){

	var _configure = function(logDebug){
		try{

			var CustomLogger = winston.transports.CustomLogger = function (options) {
				// 
				// Name this logger 
				// 
				this.name = 'BijuMongoDBLogger';

				// 
				// Set the level from your options 
				// 
				this.level = options.level || 'info';

				// 
				// Configure your storage backing as you see fit 
				// 
			};

			// 
			// Inherit from `winston.Transport` so you can take advantage 
			// of the base functionality and `.handleExceptions()`. 
			// 
			util.inherits(CustomLogger, winston.Transport);

			CustomLogger.prototype.log = function (level, msg, meta, callback) {
				// 
				// Store this message and metadata, maybe use some custom logic 
				// then callback indicating success. 
				// 
				var logModel = new LogModel({
					level : level,
					msg : msg,
					meta : meta,
					datetime : DateFormat.timeStamp()
				});

				logModel.save(function(err){
					if (err)
						return callback(err, false);
					callback(null, true);
				});
			};

			// Default transporters
			winston.remove(winston.transports.Console);

			winston.add(CustomLogger, { level: 'info'});

			winston.add(
				winston.transports.DailyRotateFile, 
				{
					name: 'dailyinfo',
					filename: __base + 'logs/info.log',
					level: 'info',
					datePattern: '.dd',
					maxsize: 1024 * 1024 * 5,
					maxFiles: 10, 
					handleExceptions: true,
					json: false,
					colorize: true,
					timestamp : DateFormat.timeStamp
				}
			);

			if(logDebug){
				console.log("Debug logging enabled");
				winston.add(
					winston.transports.Console, 
					{
						name: 'consoledebug',
						level: 'debug',
						json: false,
						colorize: true,
						handleExceptions: true,
					}
				);
			}else{
				winston.add(
					winston.transports.Console, 
					{
						name: 'consoleinfo',
						level: 'info',
						json: false,
						colorize: true,
						handleExceptions: true,
					}
				);
			}

			winston.info("Logger configured.");

			return null; //OK - no errors.

		}catch(e){
			return e;
		}
		
	}

	return {
		configure : _configure
	}

}();

module.exports = Log;

 
