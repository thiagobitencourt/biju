var app = angular.module('bijuApp');

app.controller('estoquesCtrl', function($rootScope, $scope, Restangular){

	var estoqueService = Restangular.service('estoque');
	var produtoService = Restangular.service('produto');

	var hackerFunction = function(){

		var _put = function(entity){
			entity.valorTotal = (entity.produto.vlrCusto * entity.quantidade);
			return entity.put();
		};

		return {
			myUpdate: _put
		}
	}();

	$scope.estoqueScopeProvider = {
		details: function(row){
			$rootScope.openModal('view/Estoque/modalDetailEstoque.html', row.entity, 'Estoque', 'Detalhes do Estoque', _loadEstoque, hackerFunction);
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

		Restangular.one('produto').get({"q":{"referencia":estoque.referencia}})
		.then( function(response){

			if(response.length == 0){
				$scope.estoqueError = "Referência não encontrada";
				return;
			}

			var produto = response[0];

			//estoque.tipo = produto.tipo; // TODO: Remover;
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
	  			// $scope.estoqueError = response.data.message;
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