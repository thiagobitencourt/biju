var mongoose = require('mongoose');

var validateId = function(){
	var _isIdValid = function(id){
		try{
			var objId = new mongoose.Types.ObjectId(id);
			if(objId != id){
				return false;
			}else{
				return true;
			}
		}catch(err){
			return false;
		}
	}
	return {
		isIdValid: _isIdValid
	}
}();

module.exports = validateId;