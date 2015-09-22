var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _validateId = require(__base + 'utils/validateObjectId');

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

estoqueSchema = new Schema({
  tipo: { type: String, required : true}, //Corresponde ao campo Descrição, na planilha
  produto: {type:Schema.ObjectId, ref:"Produto", required: true}, //Faz referencia a um produto existente
  quantidade: { type: Number, required : true},
  valor: { type: Number, required : true},
  valorTotal: { type: Number, required : true}, //Definido pela multiplacação de valor por quantidade (valor * quantidade).
  deletedAt: { type: Date, default: null}
});

estoqueSchema.index({tipo: 1, deletedAt: 1}, {unique: true}); //composed unique.

estoqueSchema.statics.secureFind = function(estoqueId, query, cb) {

  if(estoqueId){
    if(!_validateId.isIdValid(estoqueId)){
      return cb("Incorrect ID", null);
    }

    this.findOne({_id: estoqueId, deletedAt: { $eq: null }}, {deletedAt:0}).populate('produto').exec( function(err, estoque){
      if(err) return cb(err, null);

      if(!estoque)
        return cb("Estoque não encontrado", null);

      cb(null, estoque);
    });
  }else{
    if(!query)
      query = {};

    query.deletedAt = { $eq: null };

    this.find(query, {deletedAt:0}).populate('produto').exec( function(err, estoques){
      if(err) return cb(err, null);
      cb(null, estoques);
    });
  }
};

estoqueSchema.statics.secureDelete = function(estoqueId, cb) {

  if(!_validateId.isIdValid(estoqueId)){
    return cb("Incorrect ID", null);
  }

  this.findOneAndUpdate({_id : estoqueId,  deletedAt: { $eq: null } }, {deletedAt : getTimezonedISODateString()}, {new : true} ,function(err, p){
    if(err)
      return cb({error: err, code: 500, message : "Erro ao atualizar estoque."}, null);

    if(!p)
      return cb({message: "Estoque não encontrado.", code:400}, null);

    return cb(null, p);
  });
};

estoqueSchema.statics.secureUpdate = function(estoqueId, newEstoque, cb) {

  if(!_validateId.isIdValid(estoqueId)){
    return cb("Incorrect ID", null);
  }

  this.findOneAndUpdate({_id : estoqueId,  deletedAt: { $eq: null } }, newEstoque, {new : true} ,function(err, p){
    if(err)
      return cb({error: err, code: 500, message : "Erro ao atualizar estoque."}, null);

    if(!p)
      return cb({message: "Estoque não encontrado.", code:400}, null);

    return cb(null, p);
  });
};

Estoque = mongoose.model('Estoque', estoqueSchema);

module.exports = Estoque;

