var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _validateId = require(__base + 'utils/validateObjectId');
var AppError = require(__base + 'utils/apperror');
var logger = require('winston');

var getTimezonedISODateString = function(){
  console.warn("Use from utils : getTimezonedISODateString");
  var date = new Date();
  //Subtracts the timezone hours to local time.
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60) );
  return date.toISOString();
}

/*
MODELO: Estoque
  Tipo
  Quantidade
  Valor
  Observação
*/

/*
{
  "tipo":"Pulseiras",
  "quantidade":10,
  "valor": "16,90",
  "observacao":"Primeira pulseira"
}
*/

estoqueSchema = new Schema({
  produto: {type:Schema.ObjectId, ref:"Produto", required: true, appDescription : "Produto"}, //Faz referencia a um produto existente
  quantidade: { type: Number, required : true, appDescription : "Quantidade"},
  valor: { type: Number, required : true, appDescription : "Valor"},
  valorTotal: { type: Number, required : true, appDescription : "Valor Total"}, //Definido pela multiplacação de valor por quantidade (valor * quantidade).
  deletedAt: { type: Date, default: null, appDescription : "Removido em"}
});

//estoqueSchema.index({tipo: 1, deletedAt: 1}, {unique: true}); //composed unique.

estoqueSchema.statics.secureFind = function(estoqueId, query, cb) {

  if(estoqueId){
    if(!_validateId.isIdValid(estoqueId)){
      return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
    }

    this.findOne({_id: estoqueId, deletedAt: { $eq: null }}, {deletedAt:0}).populate('produto').exec( function(err, estoque){
      if(err) return cb(new AppError(err, null, null, 'Estoque'), null);

      if(!estoque)
        return cb(new AppError(null, "Estoque não encontrado.", AppError.ERRORS.CLIENT), null);

      cb(null, estoque);
    });
  }else{
    if(!query)
      query = {};

    query.deletedAt = { $eq: null };

    this.find(query, {deletedAt:0}).populate('produto').exec( function(err, estoques){
      if(err) return cb(new AppError(err, null, null, 'Estoque'), null);
      cb(null, estoques);
    });
  }
};

estoqueSchema.statics.secureDelete = function(estoqueId, cb) {

  if(!_validateId.isIdValid(estoqueId)){
    return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
  }

  this.findOneAndUpdate({_id : estoqueId,  deletedAt: { $eq: null } }, {deletedAt : getTimezonedISODateString()}, {new : true} ,function(err, p){
    if(err)
      return cb(new AppError(err, null, null, 'Estoque'), null);

    if(!p)
      return cb(new AppError(null, "Estoque não encontrado.", AppError.ERRORS.CLIENT), null);

    return cb(null, p);
  });
};

estoqueSchema.statics.secureUpdate = function(estoqueId, newEstoque, cb) {

  if(!_validateId.isIdValid(estoqueId)){
    return cb(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
  }

  this.findOneAndUpdate({_id : estoqueId,  deletedAt: { $eq: null } }, newEstoque, {new : true} ,function(err, p){
    if(err)
      return cb(new AppError(err, null, null, 'Estoque'), null);

    if(!p)
      return cb(new AppError(null, "Estoque não encontrado.", AppError.ERRORS.CLIENT), null);

    return cb(null, p);
  });
};

Estoque = mongoose.model('Estoque', estoqueSchema);

module.exports = Estoque;
