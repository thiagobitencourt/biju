var mongoose = require('mongoose');

var validateId = function(){
	var _isIdValid = function(id){
		try{
			var objId = new mongoose.Types.ObjectId(req.params.id);
			if(objId != req.params.id){
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