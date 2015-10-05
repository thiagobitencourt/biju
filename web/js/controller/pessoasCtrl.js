var app = angular.module('bijuApp');

app.controller('pessoasCtrl', function($rootScope, $scope, Restangular, singleFilter){

	var pessoaService = Restangular.service('pessoa');

	var hackerFunction = function(){

		var _put = function(entity){

			if(entity.pessoaReferencia){

				console.log("Pessoa referencia: " + entity.pessoaReferencia._id);

				entity.pessoaReferencia = entity.pessoaReferencia._id;
			}
			console.log(entity);

			return entity.put();
		};

		var _post = function(entity){

			if(entity.pessoaReferencia){

				console.log("Pessoa referencia: " + entity.pessoaReferencia._id);

				entity.pessoaReferencia = entity.pessoaReferencia._id;
			}
			console.log(entity);

			return pessoaService.post(entity);
		};

		return {
			myUpdate: _put,
			post: _post
		}
	}();

	$scope.pessoasScopeProvider = {
		details: function(row){
			row.entity.pessoas = pessoaService.getList().$object;
			$rootScope.openModal('view/modalDetailPessoa.html', row.entity, 'Pessoa', 'Detalhe de Pessoa', _loadPessoas, hackerFunction);
		}
	};

	$scope.pessoasGridOptions = {
	    paginationPageSizes: [10, 10, 25, 50, 100],
    	paginationPageSize: 10,
    	minRowsToShow: 11,
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
	    appScopeProvider: $scope.pessoasScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
	 };

	$scope.pessoasGridOptions.columnDefs = [
	      { name: 'nome', displayName: 'Nome'},
	      { name: 'telefoneFixo', cellFilter:'brPhoneNumber', displayName: 'Fixo'},
	      { name: 'telefoneCelular', cellFilter:'brPhoneNumber', displayName: 'Celular'},
	      { name: 'email', displayName: 'E-mail'},
	      { name: 'pessoaReferencia.nome', displayName: 'P. Ref.'},
	      { name: 'status', displayName: 'Status'}
	];

	$scope.filter = function() {
		singleFilter.values($scope.filterValue, 
			[ 'nome', 'telefoneFixo', 'telefoneCelular', 'email', 'pessoaReferencia', 'nome']);
    	$scope.gridApi.grid.refresh();
  	};

	$scope.newPessoa = function(){
		var entity = {};
		entity.pessoas = pessoaService.getList().$object;
		$rootScope.openModal('view/modalFormPessoa.html', entity, 'Pessoa', 'Nova Pessoa', _loadPessoas, hackerFunction);
	};

	var _loadPessoas = function(){
		$scope.pessoasGridOptions.data = pessoaService.getList().$object;
	};

	_loadPessoas();

});