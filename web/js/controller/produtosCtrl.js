var app = angular.module('bijuApp');

app.controller('produtosCtrl', function($scope, Restangular){

	//@TODO corregir o service RESTANGULAR

	$scope.produtosScopeProvider = {
		details: function(row){
			console.log(row.entity);
		}
	};

	$scope.produtosGridOptions = {
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
	    appScopeProvider: $scope.produtosScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
	 };

	$scope.produtosGridOptions.columnDefs = [
	      { name: 'referencia', displayName: 'Ref'},
	      { name: 'descricao', displayName: 'Descrição'},
	      { name: 'tipo', displayName: 'Tipo'},
	      { name: 'tamanho', displayName: 'Tamanho'},
	      { name: 'vlrCusto', displayName: 'Valor Custo'},
	      { name: 'vlrVenda', displayName: 'Valor Venda'}
	];

	var _loadProdutos = function(){
		$scope.produtosGridOptions.data = Restangular.all('produto').getList().$object;
	};

	_loadProdutos();

});