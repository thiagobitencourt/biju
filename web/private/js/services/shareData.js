var app = angular.module('bijuApp');
app.factory('shareData', function(){
	var _shareData = {};

	var _setData = function(name, data){
		_shareData[name] = data;
	};

	var _getData = function(name){
		return _shareData[name];
	};
	
	var _removeData = function(name){
		delete _shareData[name];
	};

	var _hasData = function(name){
		return _shareData[name] ? true : false;
	}

	return {
		set: _setData,
		get: _getData,
		remove: _removeData,
		has: _hasData
	}
});