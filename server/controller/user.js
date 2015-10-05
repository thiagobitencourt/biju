var AppError = require(__base + 'utils/apperror');
var logger = require('winston');

var UserControler = function(){

	var _User = require(__base + 'models/users');
	var _validateId = require(__base + 'utils/validateObjectId');

	var _login = function(username, password, callback){

		if(!username || !password){
			return callback(new AppError(null, "Missing username or password", AppError.ERRORS.CLIENT), null);
		}

		_User.findOne({username: username, deletedAt: { $eq: null }}, function(err, user){

			if(err){
				return callback(new AppError(err, null, null, 'User'), null);
			}

			if(!user){
				return callback(new AppError(null, "User not found or invalid password", AppError.ERRORS.CLIENT), null);
			}

			user.comparePassword(password, function(err, matchs){
				if(err){
					return callback(err, null);
				}

				if(matchs)
					return callback(null, {username: user.username});
				else{
					return callback(new AppError(null, "User not found or invalid password", AppError.ERRORS.CLIENT), false);
				}
			});
		});
	}

	/*
		This function are used to get all Users and also to get only one user by its ID.
		If the id is received by parameter, it will try to find one user. Find and retur all users otherwise.
	*/
	var _getUser = function(id, callback){

		var afterFind = function(err, user){
			if(err){
				return callback(err, null);
			}

			//Find all
			if(!id)
				return callback(null, user);

			//Find by id
			if(user){
				return callback(null, user);
			}else{
				return callback(new AppError(null, "User not found", AppError.ERRORS.CLIENT), null);
			}
		}

		if(id){
			if(!_validateId.isIdValid(id)){
				return callback(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
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
			return cb(err, null);
		}

		return cb(null, user.clean());
	}

	var _newUser = function(newUser, callback){

		if(!newUser.username || !newUser.password){
			return callback(new AppError(null, "Missing username or password", AppError.ERRORS.CLIENT), null);
		}

		/*
			If the new user has the pessoa field it must to be a valid ObjectID.
			So, before go on to update user, it will validate the pessoa field
		*/
		if(newUser.pessoa){
			if(!_validateId.isIdValid(newUser.pessoa)){
				return callback(new AppError(null, "Incorrect ID for pessoal field", AppError.ERRORS.CLIENT), null);
			}
		}
		//TODO: descomentar o else se o campo pessoa for obrigatório.
		// else{
		// 	var errObj = {code: 400, message: "Missing field pessoa"};
		// 	return callback(new AppError(null, "Missing username or password", AppError.ERRORS.CLIENT), null);
		// }

		var user = new _User();

		user.username = newUser.username;
		user.password = newUser.password;
		user.pessoa = newUser.pessoa;

		user.save(function(err, userCreated){
			return _onCreateOrUpdate(new AppError(err, null, null, 'User'), userCreated, "create", callback);
		});
	}

	var _updateUser = function(userId, newUser, callback){

		if(!_validateId.isIdValid(userId)){
			return callback(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
		}

		/*
			If the new user has the pessoa field it must to be a valid ObjectID.
			So, before go on to update user, it will validate the pessoa field
		*/
		if(newUser.pessoa){
			if(!_validateId.isIdValid(newUser.pessoa)){
				return callback(new AppError(null, "Incorrect ID for pessoal field", AppError.ERRORS.CLIENT), null);
			}
		}

		_User.secureUpdate(userId, newUser, function(err, userUpdated){
			return _onCreateOrUpdate(err, userUpdated, "update", callback);
		});
	}

	var _removeUser = function(userId, callback){

		if(!_validateId.isIdValid(userId)){
			return callback(new AppError(null, "Incorrect ID", AppError.ERRORS.CLIENT), null);
		}

		_User.secureDelete(userId, function(err, removedUser){
			if(err){
				return callback(err, null);
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
