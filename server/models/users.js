var mongoose = require('mongoose');
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;



var Schema = mongoose.Schema;

userSchema = new Schema({
  	username: { type: String, required: true, index: { unique: true }},
  	password: { type: String, required: true, unique: true},
  	pessoa: {type:Schema.ObjectId, ref:"Categoria"},
  	// deletedAt: Date
});
/*
	OBS.: O campo pessoa, poderá ser obrigatório em versões futuras.
	Neste caso adicione o atributo required: true no campo pessoa
*/

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {

    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.methods.clean = function() {
	return {username: this.username};
};

userSchema.statics.secureFind = function(userId, cb) {

  if(userId){
  	this.findOne({_id: userId}, {password:0}, function(err, user){
  		if(err) return cb(err, null);
      	cb(null, user);
    });
  }else{
    this.find({}, {password:0}, function(err, users){
      if(err) return cb(err, null);
        cb(null, users);
    });
  }
};

User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;


/*
EXEMPLOS: 

  valorEspecial: { type : Array , "default" : [] },
  criadoEm: Date,
  categoria: { type:Schema.ObjectId, required: true, ref:"Categoria"}

*/
