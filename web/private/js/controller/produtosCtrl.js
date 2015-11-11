var app = angular.module('bijuApp');

app.controller('produtosCtrl', function($rootScope, $scope, Restangular, singleFilter, uiGridConstants, shareData){

	var produtoService = Restangular.service('produto');
	var tipos = [
		{tipo:"BRACELETE"},
		{tipo:"COLAR"},
		{tipo:"BRINCO"},
		{tipo:"CINTO"},
		{tipo:"BOLSA"}];

	$scope.produtosScopeProvider = {
		details: function(row){
			tipos[0].editing = true;
			$rootScope.openModal('view/Produto/modalDetailProduto.html', row.entity, 'Produto', 'Detalhe do Produto', _loadProdutos, produtoService, tipos);
		}
	};

	$scope.produtosGridOptions = {
    paginationPageSizes: [10, 10, 25, 50, 100],
  	paginationPageSize: 50,
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
    { name: 'tipo', displayName: 'Tipo', sort: {
				/* Ordena por tipo, ascendente. Por padrão */
	          direction: uiGridConstants.ASC,
	          priority: 0,
	        }},
    { name: 'descricao', displayName: 'Descrição'},
    { name: 'tamanho', displayName: 'Tamanho'},
    { name: 'vlrCusto', cellFilter:'currency', displayName: 'Valor Custo'},
    { name: 'vlrVenda', cellFilter:'currency', displayName: 'Valor Venda'}
	];

	$scope.filter = function() {
		singleFilter.values($scope.filterValue,
			[ 'referencia', 'tipo', 'tamanho', 'vlrCusto', 'vlrVenda']);
    $scope.gridApi.grid.refresh();
  };

	$scope.newProduto = function(ref){
		tipos[0].editing = false;
		var entity = ref? {referencia: ref} : {};
		$rootScope.openModal('view/Produto/modalFormProduto.html', entity, 'Produto', 'Novo Produto', _loadProdutos, produtoService, tipos);
	};

	var _loadProdutos = function(){
		$scope.produtosGridOptions.data = produtoService.getList().$object;
	};

	var saveRef = 'saveRef';
	if(shareData.has(saveRef)){
		var ref = shareData.get(saveRef);
		shareData.remove(saveRef);
		$scope.newProduto(ref);
	}
	_loadProdutos();
});
