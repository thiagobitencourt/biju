var mongoose = require('mongoose');

var CounterSchema = new mongoose.Schema({
    _id: String,
    next: {type: Number, default: 1}
});

CounterSchema.statics.increment = function (counter, callback) {
    return this.findByIdAndUpdate(counter, { $inc: { next: 1 } }, {new: true, upsert: true, select: {next: 1}}, callback);
};

Counter = mongoose.model('Counter', CounterSchema);

module.exports = Counter;