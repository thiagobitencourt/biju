var app = angular.module('bijuApp');

app.controller('usersCtrl', function($scope, Restangular){

	//@TODO corregir o service RESTANGULAR

	$scope.usersScopeProvider = {
		details: function(row){
			console.log(row.entity);
		}
	};

	$scope.usersGridOptions = {
	    paginationPageSizes: [5, 10, 25, 50, 100],
    	paginationPageSize: 5,
	    multiSelect: false,
	    enableRowSelection: true, 
	    enableSelectAll: false,
	    enableRowHeaderSelection: false,
	    selectionRowHeaderWidth: 35,
	    onRegisterApi: function(gridApi){ 
	      $scope.gridApi = gridApi;
	    },
	    appScopeProvider: $scope.usersScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
	 };

	$scope.usersGridOptions.columnDefs = [
	      { name: 'username', displayName: 'Username'}
	];

	var _loadUsers = function(){
		$scope.usersGridOptions.data = Restangular.all('user').getList().$object;
	};

	_loadUsers();

});