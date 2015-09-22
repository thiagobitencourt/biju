var app = angular.module('bijuApp');

app.controller('estoqueCtrl', function($rootScope, $scope, Restangular){

	var estoqueService = Restangular.service('estoque');
	var produtoService = Restangular.service('produto');

	$scope.estoqueScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/modalDetailEstoque.html', row.entity, 'Estoque', 'Detalhes do Estoque', _loadEstoque, estoqueService);
		}
	};

	$scope.estoqueGridOptions = {
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
	    appScopeProvider: $scope.estoqueScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
	};

	$scope.estoqueGridOptions.columnDefs = [
	      { name: 'produto.tipo', displayName: 'Tipo'},  // Descrição
	      { name: 'produto.referencia', displayName: 'Referência'}, //REF
	      { name: 'quantidade', displayName: 'Quantidade'},
	      { name: 'produto.vlrCusto', cellFilter: 'currency', displayName: 'Valor Unit.'},
	      { name: 'valorTotal', cellFilter: 'currency', displayName: 'Valor Total'}
	];

	$scope.newEstoque = function(estoque){
		// $rootScope.openModal('view/modalFormEstoque.html', {}, 'Estoque', 'Estoque', _loadEstoque, estoqueService);

		console.log(estoque.referencia);
		Restangular.one('produto').get({"q":{"referencia":estoque.referencia}})
		.then( function(response){

			if(response.length == 0){
				$scope.estoqueError = "Referência não encontrada";
				return;
			}

			var produto = response[0];

			estoque.tipo = produto.tipo; // TODO: Remover;
			estoque.produto = produto._id;
			estoque.valor = produto.vlrCusto;
			estoque.valorTotal = (produto.vlrCusto * estoque.quantidade);

			estoqueService.post(estoque).then(function(responde){

				//Limpa os campos.
				delete $scope.estoque;
				delete $scope.estoqueError
				_loadEstoque();

			}, function(response) {
				delete $scope.estoque;
	  			$scope.estoqueError = response.data;
			});
		});
	};

	$scope.totalEstoque = 0;

	var _calcularTotal = function(estoque){

		$scope.totalValorEstoque = estoque.reduce(function(previous, current, index, estoque){
			return previous + estoque[index].valorTotal;
		}, 0);

		$scope.totalProdutosEstoque = estoque.reduce(function(previous, current, index, estoque){
			return previous + estoque[index].quantidade;
		}, 0);
	}

	var _loadEstoque = function(){

		estoqueService.getList().then(function(response){

		console.log(response);
		_calcularTotal(response);

		$scope.estoqueGridOptions.data = response;
		});

		// var estoque = estoqueService.getList().$object;

	};

	_loadEstoque();

});