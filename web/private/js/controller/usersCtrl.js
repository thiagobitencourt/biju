var app = angular.module('bijuApp');

app.controller('usersCtrl', function($scope, $rootScope, Restangular, singleFilter){

	var userService = Restangular.service('user');
	var pessoaService = Restangular.service('pessoa');

var hackerFunction = function(){

		var _put = function(entity){

			entity.pessoa = entity.pessoa._id;

			if(!entity.password){
				return entity.put();
			}else if(entity.password && entity.password === entity.repPassword){
				return entity.put();
			}else{
				var errMessage = "Repita a senha corretamente";
				return {
					then: function(cbOk, cbErr){
						var obj = {data: errMessage};
						return cbErr(obj);
					}
				};
			}
		};

		var _post = function(entity){

			var errMessage = null;
			var okMessage = null;

			entity.pessoa = entity.pessoa._id;

			if(!entity.password){
				errMessage = "Insira uma senha";
			}else if(entity.password && entity.password != entity.repPassword){
				errMessage = "Repita a senha corretamente";
			}else{
				return userService.post(entity);
			}

			return {
				then: function(cbOk, cbErr){
					var obj = {data: {message: errMessage}};
					return cbErr(obj);
				}
			}
		};

		return {
			myUpdate: _put,
			post: _post
		}
	}();

	$scope.usersScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/User/modalDetailUser.html', row.entity, 'User', 'Detalhes do Usuário', _loadUsers, hackerFunction, $scope.pessoas);
		}
	};

	$scope.usersGridOptions = {
	    paginationPageSizes: [5, 10, 25, 50, 100],
    	paginationPageSize: 50,
	    multiSelect: false,
	    enableRowSelection: true,
	    enableSelectAll: false,
	    enableRowHeaderSelection: false,
	    selectionRowHeaderWidth: 35,
	    enableFiltering: false,
	    onRegisterApi: function(gridApi){
	      $scope.gridApi = gridApi;
	      $scope.gridApi.grid.registerRowsProcessor( singleFilter.filter, 200 );
	    },
	    appScopeProvider: $scope.usersScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
	 };

	$scope.usersGridOptions.columnDefs = [
			{ name: 'pessoa.nome', displayName: 'Nome'},
	      	{ name: 'username', displayName: 'Username'}
	];

	$scope.filter = function() {
		singleFilter.values($scope.filterValue,
			[ 'username', 'pessoa', 'nome']);
    	$scope.gridApi.grid.refresh();
 	};

	$scope.newUser = function(){
		var entity = {};
		$rootScope.openModal('view/User/modalFormUser.html', entity, 'User', 'Novo Usuário', _loadUsers, hackerFunction, $scope.pessoas);
	};

	var _loadUsers = function(){
		$scope.usersGridOptions.data = userService.getList().$object;
		$scope.pessoas = pessoaService.getList().$object;
	};

	_loadUsers();
});
