var dateFormat = function(){
	var _getTimeStamp = function(){
		var date = new Date();
		//Subtracts the timezone hours to local time.
		date.setHours(date.getHours() - (date.getTimezoneOffset() / 60) );
		return date.toISOString();
	}
	return {
		timeStamp: _getTimeStamp
	}
}();

module.exports = dateFormat;