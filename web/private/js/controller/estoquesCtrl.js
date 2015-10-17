var app = angular.module('bijuApp');

app.controller('estoquesCtrl', function($rootScope, $scope, Restangular, singleFilter){

	var estoqueService = Restangular.service('estoque');
	var produtoService = Restangular.service('produto');

	var oldEntity = null;

	var hackerFunction = function(){

		var _put = function(entity){
			if(entity.subtrair === true){
				/*
					Se estiver subtraindo, então verifica se a quantidade a ser subtraida é maior que o total disponível.
					Se for menor, não deve subtrarir e deve mostrar uma mensagem ao usuário.
					Se a quantidade a ser removida foi menor que a quantidade total, então calcula a nova quantidade e manda para o back-end.
					Se não estiver subtraindo, apenas manda a nova quantidade.
				*/
				var errMessage = '';
				var qdtInt = parseInt(entity.quantidade);
				if(qdtInt >  oldEntity.quantidade){
					errMessage = "Não é possível remover mais produtos do que quantidade total: " + oldEntity.quantidade;
					return {
						then: function(cbOk, cbErr){
							var obj = {data: {message: errMessage}};
							return cbErr(obj);
						}
					}
				}else{
					entity.quantidade = oldEntity.quantidade - qdtInt;
					oldEntity = null;
					return entity.put();
				}
			}else{
				return entity.put();
			}
		}

		return {
			myUpdate: _put
		}
	}();

	$scope.estoqueScopeProvider = {
		details: function(row){
			row.entity.edit = true;
			oldEntity = angular.copy(row.entity);
			$rootScope.openModal('view/Estoque/modalFormEstoque.html', row.entity, 'Estoque', 'Novo Estoque', _loadEstoque, hackerFunction, null);
		}
	};

	$scope.estoqueGridOptions = {
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

	$scope.filter = function() {
		singleFilter.values($scope.filterValue,
			['produto', 'tipo', 'referencia', 'quantidade']);
    	$scope.gridApi.grid.refresh();
  	};

	$scope.newEstoque = function(){
		var entity = {};
		$rootScope.openModal('view/Estoque/modalFormEstoque.html', entity, 'Estoque', 'Novo Estoque', _loadEstoque, estoqueService, null);
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

	var _validaValorEstoque = function(estoque){

		//TODO: Tirar esta lógica, deve estar no back-end
		/*
			Verifica se o valorTotal do estoque esta correto baseado no valor de um produto e quantidade.
			Se o valor não estiver correto, atualiza e atualiza a base de dados.
		*/
		angular.forEach(estoque, function(estq){
			var valorEsperado = (estq.produto.vlrCusto * estq.quantidade);
			if(estq.valorTotal != valorEsperado){
				console.log("Valores diferentes - Atualiza base de dados");
				estq.valorTotal = valorEsperado;
				estq.put().then(function(res){}, function(resErr){ console.log("error: " + resErr)});
			}
		});
	}

	var _loadEstoque = function(){

		estoqueService.getList().then(function(response){

			_validaValorEstoque(response);
			_calcularTotal(response);

			$scope.estoqueGridOptions.data = response;
		});
	};

	_loadEstoque();
});
