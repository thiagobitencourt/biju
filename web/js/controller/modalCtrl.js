var app = angular.module('bijuApp');

app.controller('modalCtrl', function($rootScope, $scope, $modalInstance, Restangular, entity, type, title, loadDataTableGrid) {
	
	$scope.entity = entity;
	$scope.type = type;
	$scope.title = title;

	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.editFromDetail = function(entity){
		$modalInstance.close();
		$rootScope.openModal('view/modalForm'+type+'.html', Restangular.copy(entity), null, 'Editar '+type, loadDataTableGrid);
	};

	$scope.removeFromDetail = function(entity){
		$modalInstance.close();
		$rootScope.openModal('view/modalDelete'+type+'.html', entity, null, 'Excluir '+type, loadDataTableGrid);
	};

	$scope.remove = function(entity){
		entity.remove().then(function(){
			$modalInstance.close();
			loadDataTableGrid();
  	}, function(response) {
	  	$scope.errorMessage = response.data;
		});
	};

	$scope.save = function(entity){
		if (_isUndefinedOrNull(entity._id) ){
			//@TODO service restangular
			Restangular.all('produto').post(entity).then(function(response){
				$modalInstance.dismiss();
				loadDataTableGrid();
	  	}, function(response) {
			  $scope.errorMessage = response.data;
			});
		} else {
			entity.put().then(function(response){
				$modalInstance.dismiss();
				loadDataTableGrid();
	  	}, function(response) {
			  $scope.errorMessage = response.data;
			});
		}
	};

	var _isUndefinedOrNull = function(val) {
		return angular.isUndefined(val) || val === null;
	}

});