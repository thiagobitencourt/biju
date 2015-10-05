var app = angular.module('bijuApp');

app.controller('usersCtrl', function($scope, $rootScope, Restangular, singleFilter){

	//@TODO corregir o service RESTANGULAR
	var userService = Restangular.service('user');
	var pessoaService = Restangular.service('pessoa');

	var hackerFunction = function(){

		var _put = function(entity){

			entity.pessoa = entity.pessoa._id;
			delete entity.pessoas;

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
			delete entity.pessoas;

			if(!entity.password){
				errMessage = "Insira uma senha";
			}else if(entity.password && entity.password != entity.repPassword){
				errMessage = "Repita a senha corretamente";
			}else{
				return userService.post(entity);
			}

			return {
				then: function(cbOk, cbErr){
					var obj = {data: errMessage};
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
			row.entity.pessoas = pessoaService.getList().$object;
			$rootScope.openModal('view/modalDetailUsuario.html', row.entity, 'Usuario', 'Detalhes do Usuário', _loadUsers, hackerFunction);
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
		entity.pessoas = pessoaService.getList().$object;
		$rootScope.openModal('view/modalFormUsuario.html', entity, 'Usuario', 'Novo Usuário', _loadUsers, hackerFunction);
	};

	var _loadUsers = function(){
		$scope.usersGridOptions.data = userService.getList().$object;
	};

	_loadUsers();
});