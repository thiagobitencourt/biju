var app = angular.module('bijuApp');

app.controller('produtosCtrl', function($rootScope, $scope, Restangular, singleFilter){

	var produtoService = Restangular.service('produto');

	$scope.produtosScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/Produto/modalDetailProduto.html', row.entity, 'Produto', 'Detalhe do Produto', _loadProdutos, produtoService);
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
    enableFiltering: false,
    onRegisterApi: function(gridApi){ 
      $scope.gridApi = gridApi;
      $scope.gridApi.grid.registerRowsProcessor( singleFilter.filter, 200 );
    },
    appScopeProvider: $scope.produtosScopeProvider,
    rowTemplate: 'view/template-dblclick.html'
	 };

	$scope.produtosGridOptions.columnDefs = [
    { name: 'referencia', displayName: 'Ref'},
    { name: 'tipo', displayName: 'Tipo'},
    { name: 'descricao', displayName: 'Descrição'},
    { name: 'tamanho', displayName: 'Tamanho'},
    { name: 'vlrCusto', cellFilter:'currency', displayName: 'Valor Custo'},
    { name: 'vlrVenda', cellFilter:'currency', displayName: 'Valor Venda'}
	];

	$scope.filter = function() {
		singleFilter.values($scope.filterValue, 
			[ 'referencia', 'tipo', 'tamanho']);
    $scope.gridApi.grid.refresh();
  };

	$scope.newProduto = function(){
		$rootScope.openModal('view/Produto/modalFormProduto.html', {}, 'Produto', 'Novo Produto', _loadProdutos, produtoService);
	};

	var _loadProdutos = function(){
		$scope.produtosGridOptions.data = produtoService.getList().$object;
	};

	_loadProdutos();
});