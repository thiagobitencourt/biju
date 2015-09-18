var UserControler = function(){

	var _User = require(__base + 'models/users');
	var _validateId = require(__base + 'utils/validateObjectId');

	var _login = function(username, password, callback){

		if(!username || !password){
			var errObj = {code: 400, message: "Missing username or password"};
			return callback(errObj, null);
		}

		_User.findOne({username: username, deletedAt: { $eq: null }}, function(err, user){

			if(err){
				var errObj = {error: err, code: 500, message: "Error on find user"};
				return callback(errObj, null);
			}

			if(!user){
				var errObj = {code: 401, message: "User not found or invalid password"};
				return callback(errObj, null);
			}
			
			user.comparePassword(password, function(err, matchs){
				if(err){
					var errObj = {error: err, code: 500, message: "Error on authenticate user"};
					return callback(errObj, null);
				}

				if(matchs)
					return callback(null, {username: user.username});
				else{
					var errObj = {code: 401, message: "User not found or invalid password"};
					return callback(errObj, false);
				}
			});
		});
	}

	var _getUser = function(id, callback){

		var afterFind = function(err, user){
			if(err){
				var errObj = {error: err, code: 500, message: "Error on find user"};
				return callback(errObj, null);
			}

			//Find all
			if(!id)
				return callback(null, user);

			//Find by id
			if(user){
				return callback(null, user);
			}else{
				var errObj = {code: 400, message: "User not found"};
				return callback(errObj, null);
			}
		}

		if(id){
			//TODO. PAREI AQUI. ID supostamente válido, mas não valida.
			if(!_validateId.isIdValid(id)){
				var errObj = {code: 400, message: "Incorrect ID"};
				return callback(errObj, null);
			}

			//Find by id
			_User.secureFind(id, function(err, user){
				afterFind(err, user);
			});
		}else{
			//Find all
			_User.secureFind(null, function(err, user){
				afterFind(err, user);
			});
		}
	}

	/*
		Same function called on createUser and updateUser operation.
		Analise the err and user parameters end call the callback with well appropriate response
	*/
	var _onCreateOrUpdate = function(err, user, operation, cb){
		if(err){
			var errObj = {error: err, code: 500, message: "Error on " + operation + " user"};
			if(err.code == 11000){
				errObj.code = 400;
				errObj.message = "Username already in use";
				errObj.error = null;
			}

			return cb(errObj, null);
		}

		return cb(null, user.clean());
	}

	var _newUser = function(newUser, callback){

		if(!newUser.username || !newUser.password){
			var errObj = {code: 400, message: "Missing field username or password"};
			return callback(errObj, null);
		}

		/*
			If the new user has the pessoa field it must to be a valid ObjectID.
			So, before go on to update user, it will validate the pessoa field
		*/
		if(newUser.pessoa){
			if(!_validateId.isIdValid(newUser.pessoa)){
				var errObj = {code: 400, message: "Incorrect ID for pessoal field"};
				return callback(errObj, null);
			}
		}
		//TODO: descomentar o else se o campo pessoa for obrigatório.
		// else{
		// 	var errObj = {code: 400, message: "Missing field pessoa"};
		// 	return callback(errObj, null);
		// }

		var user = new _User();

		user.username = newUser.username;
		user.password = newUser.password;

		user.save(function(err, userCreated){
			return _onCreateOrUpdate(err, userCreated, "create", callback);
		});
	}

	var _updateUser = function(userId, newUser, callback){

		if(!_validateId.isIdValid(userId)){
			var errObj = {code: 400, message: "Incorrect ID"};
			return callback(errObj, null);
		}

		/*
			If the new user has the pessoa field it must to be a valid ObjectID.
			So, before go on to update user, it will validate the pessoa field
		*/
		if(newUser.pessoa){
			if(!_validateId.isIdValid(newUser.pessoa)){
				var errObj = {code: 400, message: "Incorrect ID for pessoal field"};
				return callback(errObj, null);
			}
		}

		_User.secureUpdate(userId, newUser, function(err, userUpdated){
			return _onCreateOrUpdate(err, userUpdated, "update", callback);
		});
	}

	var _removeUser = function(userId, callback){

		if(!_validateId.isIdValid(userId)){
			var errObj = {code: 400, message: "Incorrect ID"};
			return callback(errObj, null);
		}

		_User.secureDelete(userId, function(err, removedUser){
			if(err){
				var errObj = {error: err, code: err.code || 500, message: (err.code == 400? err.message : "Error on remove user")};
				return callback(errObj, null);
			}

			return callback(null, removedUser);
		});
	}

	return {
		login: _login,
		newUser: _newUser,
		updateUser: _updateUser,
		removeUser: _removeUser,
		getUser: _getUser
	}
}();

module.exports = UserControler;