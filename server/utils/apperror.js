var mongoose = require('mongoose');
var logger = require('winston');

var AppError = function(_nativeError, _message, _type, _modelName){
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = "AppError";

  this.native = _nativeError || null;
  this.message = _message || null;
  this.appErrorType = _type || AppError.ERRORS.INTERNAL;
  this.model = _modelName || null;

}

AppError.prototype.__proto__ = Error.prototype;

AppError.prototype.clientify = function(){
  if(!this.native){
    throw new Error("Cannot clientify with null native error");
  }

  if(this.native.code){
    switch (this.native.code) {
      case 11000:
        var schema = mongoose.model(this.model).schema;

        var tmp_err_message = this.native.errmsg.split("dup key:");
        this.message = "O seguinte valor não pode ser inserido pois já foi utilizado na base de dados: " + tmp_err_message[1];
        this.appErrorType = AppError.ERRORS.CLIENT;
        return this.message;
        break;
      default:
        this.appErrorType = AppError.ERRORS.INTERNAL;
        this.message = "UNKNOWN ERROR";
    }
  }else if (this.native.name) {
    switch (this.native.name) {
      case "ValidationError":
        // this.message = this.native.toString();
        // return; //////////////////////////// teste
        this.appErrorType = AppError.ERRORS.CLIENT;
        this.message = "Erro de validação.";
        if(this.model){
          var schema = null;
          try {
            schema = mongoose.model(this.model).schema;
            for (var attr in this.native.errors) {
              this.message += " Campo [" + schema.paths['referencia'].options['appDescription'] || this.native.errors[attr].path
              + "] com problema: " + AppError.MONGOOSE.KIND[this.native.errors[attr].kind] || this.native.errors[attr].kind + ";";
            }
          } catch (e) {
            logger.error(e.toString());
            this.appErrorType = AppError.ERRORS.INTERNAL;
            this.message = "NÃO É POSSÍVEL AVALIAR ERRO, DEVIDO AO ERRO INTERNO: " + e.toString();
          }

        }else{
          this.message += " Não é possível especificar o erro de validação.";
        }

        break;
      default:

    }

  }
  return this;
}

AppError.ERRORS = {
  INTERNAL : 500, /*DEFAULT*/
  CLIENT : 400,
  NOT_FOUND : 404,
  FORBIDDEN : 403
}

AppError.MONGOOSE = {
  KIND : {
    'required' : 'Obrigatório'
  }
}

module.exports = AppError;
