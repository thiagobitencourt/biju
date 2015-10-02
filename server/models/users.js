var mongoose = require('mongoose');
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var dateFormat = require(__base + 'utils/dateFormat');

var Schema = mongoose.Schema;

userSchema = new Schema({
  	username: { type: String, required: true, index: { unique: true }},
  	password: { type: String, required: true, unique: true},
  	pessoa: {type:Schema.ObjectId, ref:"Pessoa"},
  	deletedAt: { type: Date, default: null}
});
/*
  TODO: Pessoa como require:true
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
  var resObj = {};
  resObj._id = this._id;
  resObj.username = this.username;
  if(this.pessoa)
    resObj.pessoa = this.pessoa;

	return resObj;
};

userSchema.statics.secureFind = function(userId, cb) {

  if(userId){
  	this.findOne({_id: userId, deletedAt: { $eq: null }}, {password:0, deletedAt:0}).populate('pessoa').exec(function(err, user){
  		if(err) return cb(err, null);
      	cb(null, user);
    });
  }else{
    this.find({deletedAt: { $eq: null }}, {password:0, deletedAt:0}).populate('pessoa').exec(function(err, users){
      if(err) return cb(err, null);
        cb(null, users);
    });
  }
};

userSchema.statics.secureDelete = function(userId, cb) {
  this.findOne({_id: userId}, {password:0}, function(err, user){
    if(err) return cb(err, null);

      if(user){
        user.deletedAt = dateFormat.timeStamp();
        user.save();
        cb(null, user);
      }else{
        cb({message: "User Not Found", code:400}, null);
      }
  });
};

userSchema.statics.secureUpdate = function(userId, newUser, cb) {

  this.findOne({_id: userId, deletedAt: { $eq: null }}, function(err, user){
    if(err) return cb(err, null);

      if(user){

        if(newUser.password){
          user.password = newUser.password;
        }

        if(newUser.pessoa && user.pessoa != newUser.pessoa || newUser.pessoa == null){
          user.pessoa = newUser.pessoa;
        }

        if(newUser.username && user.username != newUser.username){

          this.findOne({username: newUser.username}, function(err, hasUser){
            if(err) return cd(err, null);

            if(!hasUser){
              user.username = newUser.username;

              user.save(function(err, us){
                if(err) return cb(err, null);

                return cb(null, us);
              });
            }else{
              //Return with mongo duplicate key error code
              var errObj = {code: 11000, message:"Username already in use"};
              return cd(errObj, null);
            }
          });
        }else{
          user.save();
          return cb(null, user);
        }

      }else{
        return cb({message: "User Not Found", code:400}, null);
      }
  });
};


User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
