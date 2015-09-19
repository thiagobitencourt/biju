var app = angular.module('bijuApp');

app.controller('pessoasCtrl', function($rootScope, $scope, Restangular){

	//@TODO corregir o service RESTANGULAR

	$scope.pessoasScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/modalDetailPessoa.html', row.entity, 'Pessoa', 'Detalhe de Pessoa', _loadPessoas);
		}
	};

	$scope.pessoasGridOptions = {
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
	    appScopeProvider: $scope.pessoasScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
	 };

	$scope.pessoasGridOptions.columnDefs = [
	      { name: 'nome', displayName: 'Nome'},
	      { name: 'telefoneFixo', displayName: 'Fixo'},
	      { name: 'telefoneCelular', displayName: 'Celular'},
	      { name: 'email', displayName: 'E-mail'},
	      { name: 'pessoaReferencia', displayName: 'P. Ref.'},
	      { name: 'status', displayName: 'Status'}
	];

	$scope.newPessoa = function(){
		$rootScope.openModal('view/modalFormPessoa.html', {}, 'Pessoa', 'Nova Pessoa', _loadPessoas);
	};

	var _loadPessoas = function(){
		$scope.pessoasGridOptions.data = Restangular.all('pessoa').getList().$object;
	};

	_loadPessoas();

});