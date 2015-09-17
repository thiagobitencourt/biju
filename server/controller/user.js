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

	var _newUser = function(newUser, callback){

		if(!newUser.username || !newUser.password){
			var errObj = {code: 400, message: "Missing field username or password"};
			return callback(errObj, null);
		}

		var user = new _User();

		user.username = newUser.username;
		user.password = newUser.password;

		user.save(function(err, userCreated){

			if(err){
				var errObj = {error: err, code: 500, message: "Error on create user"};
				if(err.code == 11000){
					errObj.code = 400;
					errObj.message = "Username already in use";
					errObj.error = null;
				}

				return callback(errObj, null);
			}

			return callback(null, userCreated.clean());
		});
	}

	var _updateUser = function(userId, newUser, callback){

		if(!_validateId.isIdValid(userId)){
			var errObj = {code: 400, message: "Incorrect ID"};
			return callback(errObj, null);
		}

		var errObj = {code: 501, message: "Not implemented yet"};
		return callback(errObj, null);
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

		// var errObj = {code: 501, message: "Not implemented yet"};
		// return callback(errObj, null);
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