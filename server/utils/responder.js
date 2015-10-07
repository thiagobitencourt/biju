var logger = require('winston');

var Responser = (function(){

  var _process = function(res, obj){

    if (!res || !obj )
      throw new Error("Missing res or/and obj parameters.");

    if(obj.name && obj.name === "AppError"){ //AppError
      logger.debug(obj);
      if(!obj.message){
        obj.clientify();
      }
      return res.status(obj.appErrorType).send({code : obj.appErrorType, message: obj.message || obj.native.toString(), nativeError : obj.native});
    }

    if(obj.stack){ //Native Error
      return res.status(500).send({code : 500, message: obj.toString(), nativeError : obj.stack});
    }

    res.status(200).send(obj);
  };

  return {
    process : _process
  };

})();

module.exports = Responser.process;
