var app = angular.module('bijuApp');
app.controller('bijuCtrl', function($rootScope, $scope, $location, $modal){
	
	$rootScope.isActive = function (viewLocation) { 
    return viewLocation === $location.path();
  };

  $rootScope.go = function ( path ) {
	  $location.path( path );
	};

  $rootScope.openModal = function(template, entity, type, title, loadDataTableGrid, serviceEntity, pessoas){

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
				},
				serviceEntity: function(){
					return serviceEntity;
				},
				pessoas: function(){
					return pessoas;
				}
			}
		});

	};

});