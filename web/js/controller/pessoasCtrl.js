var app = angular.module('bijuApp');

app.controller('pessoasCtrl', function($rootScope, $scope, Restangular){

	var pessoaService = Restangular.service('pessoa');

	$scope.pessoasScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/modalDetailPessoa.html', row.entity, 'Pessoa', 'Detalhe de Pessoa', _loadPessoas, pessoaService);
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
	    onRegisterApi: function(gridApi){ 
	      $scope.gridApi = gridApi;
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

	$scope.newPessoa = function(){
		$rootScope.openModal('view/modalFormPessoa.html', {}, 'Pessoa', 'Nova Pessoa', _loadPessoas, pessoaService);
	};

	var _loadPessoas = function(){
		pessoaService.getL
		$scope.pessoasGridOptions.data = pessoaService.getList().$object;
	};

	_loadPessoas();

});