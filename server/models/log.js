var mongoose = require('mongoose');

var Schema = mongoose.Schema;

logSchema = new Schema({}, { strict: false }); //accepts anything

Log = mongoose.model('Log', logSchema);

module.exports = Log;
