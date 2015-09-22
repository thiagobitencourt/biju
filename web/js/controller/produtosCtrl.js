var app = angular.module('bijuApp');

app.controller('produtosCtrl', function($rootScope, $scope, Restangular){

	var produtoService = Restangular.service('produto');

	$scope.produtosScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/modalDetailProduto.html', row.entity, 'Produto', 'Detalhe do Produto', _loadProdutos, produtoService);
		}
	};

	$scope.produtosGridOptions = {
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
		$rootScope.openModal('view/modalFormProduto.html', {}, 'Produto', 'Novo Produto', _loadProdutos, produtoService);
	};

	var _loadProdutos = function(){
		$scope.produtosGridOptions.data = produtoService.getList().$object;
	};

	_loadProdutos();

});