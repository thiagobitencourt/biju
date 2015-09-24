var app = angular.module('bijuApp');

app.controller('modalCtrl', function($rootScope, $scope, $modalInstance, Restangular, entity, type, title, loadDataTableGrid, serviceEntity) {
	
	$scope.entity = entity;
	$scope.type = type;
	$scope.title = title;

	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.editFromDetail = function(entity){
		$modalInstance.close();
		$rootScope.openModal('view/modalForm'+type+'.html', Restangular.copy(entity), null, 'Editar '+type, loadDataTableGrid, serviceEntity);
	};

	$scope.removeFromDetail = function(entity){
		$modalInstance.close();
		$rootScope.openModal('view/modalDelete'+type+'.html', entity, null, 'Excluir '+type, loadDataTableGrid, serviceEntity);
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
			serviceEntity.post(entity).then(function(response){
				$modalInstance.dismiss();
				loadDataTableGrid();
	  	}, function(response) {
			  $scope.errorMessage = response.data;
			});
		} else {

			var successFunction = function(response){
				$modalInstance.dismiss();
				loadDataTableGrid();
	  		};

	  		var errorFunction = function(response) {
				$scope.errorMessage = response.data;
			};

			if(serviceEntity.myUpdate){
				serviceEntity.myUpdate(entity).then(successFunction, errorFunction);	
			}else{
				entity.put().then(successFunction, errorFunction);
			}
		}
	};

	var _isUndefinedOrNull = function(val) {
		return angular.isUndefined(val) || val === null;
	}

});