var app = angular.module('bijuApp');
app.controller('bijuCtrl', function($rootScope, $scope, $location, $modal){
	
	$rootScope.isActive = function (viewLocation) { 
    return viewLocation === $location.path();
  };

  $rootScope.openModal = function(template, entity, type, title, loadDataTableGrid){

		$modal.open({
			animation: true, 
			templateUrl: template,
			size: 'lg',
			controller: 'modalCtrl',
			resolve: {
				entity: function(){
					return entity;
				},
				type: function(){
					return type;
				},
				title: function(){
					return title;
				},
				loadDataTableGrid: function(){
					return loadDataTableGrid;
				}
			}
		});

	};

});