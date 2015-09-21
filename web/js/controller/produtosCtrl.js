var app = angular.module('bijuApp');

app.controller('produtosCtrl', function($rootScope, $scope, Restangular){

	//@TODO corregir o service RESTANGULAR

	$scope.produtosScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/modalDetailProduto.html', row.entity, 'Produto', 'Detalhe do Produto', _loadProdutos);
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
	      { name: 'vlrCusto', cellFilter:'currency', displayName: 'Valor Custo'},
	      { name: 'vlrVenda', cellFilter:'currency', displayName: 'Valor Venda'}
	];

	$scope.newProduto = function(){
		$rootScope.openModal('view/modalFormProduto.html', {}, 'Produto', 'Novo Produto', _loadProdutos);
	};

	var _loadProdutos = function(){
		$scope.produtosGridOptions.data = Restangular.all('produto').getList().$object;
	};

	_loadProdutos();

});