var AppError = require('../utils/apperror');
var responder = require('../utils/responder');

var res = {};
res._status = null;
res.status = function(code){
  res._status = code;
  return res;
}
res.send = function(obj){
  console.log("sending...");
  console.log(obj);
}


var nativeError = new Error("NativeError");



responder(res, {});
responder(res, new Error("Null.Pau.Exception"));
responder(res, new AppError(null, "AppError cru"));
responder(res, new AppError(null, "AppError cru com tipo." , AppError.ERRORS.CLIENT));
responder(res, new AppError(nativeError, "AppError com native"));
responder(res, new AppError(nativeError, "AppError com native e codigo", AppError.ERRORS.CLIENT));
responder(res, new AppError(nativeError));
responder(res, new AppError("clientify forçado").clientify());
