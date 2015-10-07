var app = angular.module('bijuApp');

app.controller('kitsCtrl', function($rootScope, $scope, $location, $filter, Restangular, singleFilter, shareData, focus){


	if(shareData.has('kit')){
		$scope.kit = shareData.get('kit');
		shareData.remove('kit');
	}

	var kitService = Restangular.service('kit');
	var produtoService = Restangular.service('produto');
	var pessoaService = Restangular.service('pessoa');
		
	$scope.estadosKit = 
		{NOVO: 'Novo',
		GERADO:'Gerado', 
		ENTREGUE:'Entregue',
		FECHADO:'Fechado'};

	$scope.kitsScopeProvider = {
		details: function(row){
			shareData.set('kit',row.entity);
			$rootScope.go('/detalhes-kit');
		}
	};

	$scope.kitsGridOptions = {
	    paginationPageSizes: [20, 50, 100],
    	paginationPageSize: 20,
    	minRowsToShow: 21,
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
	    appScopeProvider: $scope.kitsScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
 	};

	$scope.kitsGridOptions.columnDefs = [
    	{ name: 'codigo', displayName: 'Codigo'},
    	{ name: 'pessoa.nome', displayName: 'Pessoa'},
	    { name: 'vlrTotalKit', displayName: 'Valor Total'},
	    { name: 'estado', displayName: 'Estado', cellTemplate: 'view/Kit/kit-template-estado.html'}
	];

	$scope.filter = function() {
		singleFilter.values($scope.filterValue, 
			['estado', 'codigo', 'pessoa', 'nome']);
    	$scope.gridApi.grid.refresh();
  	};

	var _loadKits = function(){
		$scope.kitsGridOptions.data = kitService.getList().$object;
	};

	var _loadPessoas = function(){
		$scope.pessoas = pessoaService.getList().$object;
	};

	//@TODO parametrizar function com rota
	$scope.editarKitForm = function(){
		shareData.set('kit', $scope.kit);
		$rootScope.go('/editar-kit');
	};

	//@TODO parametrizar function com rota
	$scope.gerarKitForm = function(){
		shareData.set('kit', { estado: $scope.estadosKit.NOVO, itens: [], vlrTotalKit: 0 });
		$rootScope.go('/gerar-kit');
	};

	//@TODO parametrizar function com rota
	$scope.entregarKitForm = function(){
		shareData.set('kit', $scope.kit);
		$rootScope.go('/entregar-kit');
	};

	//@TODO parametrizar function com rota
	$scope.fecharKitForm = function(){
		shareData.set('kit', $scope.kit);
		$rootScope.go('/fechar-kit');
	};

	//@TODO parametrizar function com estado
	$scope.gerarKit = function(){

		var _kit = $scope.kit;
		_kit.estado = $scope.estadosKit.GERADO;
		
		kitService.post(_kit).then(function(response){
			$rootScope.go('/kits');
		}, function(response){
			console.log(response);
		});

	};

	//@TODO parametrizar function com estado
	$scope.entregarKit = function(){

		var _kit = $scope.kit;
		_kit.estado = $scope.estadosKit.ENTREGUE;

		_kit.put().then(function(response){
			$rootScope.go('/kits');
		}, function(response){
			console.log('erro ao atualizar kit');
		});
	};

	//@TODO parametrizar function com estado
	$scope.fecharKit = function(){

		var _kit = $scope.kit;
		_kit.estado = $scope.estadosKit.FECHADO;

		_kit.put().then(function(response){
			$rootScope.go('/kits');
		}, function(response){
			console.log('erro ao atualizar kit');
		});
	};


	$scope.inserirItem = function(produto){
		var produtoExistente = false;

		angular.forEach($scope.kit.itens, function(item){
			if(item.produtoCompleto.referencia === produto.referencia){
				item.qtdeEntregue = parseInt(item.qtdeEntregue) + parseInt(produto.quantidade);
				$scope.kit.vlrTotalKit = calcularValorTotalKit($scope.kit.itens);
				produtoExistente = true;
				focus('referencia');
			}
		});

		if(!produtoExistente){
			Restangular.one('produto').get({"q":{"referencia":produto.referencia}})
			.then( function(response){
				$scope.kit.itens.push(
					{
						"produtoCompleto": response[0],
						"produto": response[0]._id,
						"qtdeEntregue" : produto.quantidade,
						"qtdeDevolvida" : 0,
						"vlrUnit" : response[0].vlrCusto,
						"vlrTotal" :produto.quantidade * response[0].vlrCusto
					}
				);
				$scope.produto = {quantidade: 1};
				$scope.kit.vlrTotalKit = calcularValorTotalKit($scope.kit.itens);
				focus('referencia');
			}, function(error){
				//@TODO tratar erro se o produto nao existe
				console.log(error);
			});
		}	
	};

	//remover um item da tabela em geracao
	$scope.removerItem = function(_id){
		angular.forEach($scope.kit.itens, function(item, index){
			if(item.produto === _id){
				$scope.kit.itens.splice(index, 1);
			}
		});
		$scope.kit.vlrTotalKit = calcularValorTotalKit($scope.kit.itens);
	};


	$scope.devolverItem = function(produto){
		angular.forEach($scope.kit.itens, function(item){
			if(item.produto.referencia === produto.referencia){
				if(produto.quantidade <= item.qtdeEntregue){
					item.qtdeDevolvida = parseInt(item.qtdeDevolvida) + parseInt(produto.quantidade);
				}else{
					console.log('nao e possivel devolver quantidade maior que entregue');
				}
			}
		});
		$scope.produto = {quantidade: 1};
		$scope.kit.vlrTotalDivida = calcularValorTotalDivida($scope.kit.itens);
		$scope.geraParamentos();
	};

	$scope.zerarQtdDevolvida = function(item){
		item.qtdeDevolvida = 0;
		$scope.kit.vlrTotalDivida = calcularValorTotalDivida($scope.kit.itens);
		$scope.geraParamentos();
	};

	$scope.checkPessoa = function(){
		return angular.isUndefined($scope.kit.pessoa);
	};

	$scope.geraParamentos = function(){
		var _numeroParcelas = parseInt(angular.copy($scope.kit.numeroParcelas));
		var _valorTotalDivida = angular.copy($scope.kit.vlrTotalDivida);
		var _dataEntrega = angular.copy($scope.kit.dataEntrega);

		// console.log(_dataEntrega);
		// console.log(addDaysToDate(_dataEntrega, 45));
		$scope.kit.pagamentos = [];

		var _dataVencimento = new Date();
		//@TODO gerar datas para vencimentos 
		for (var i = 0; i < _numeroParcelas; i++) {
			//@TODO corregir logica dos dias
			// if(i === 0){
			// 	var _dataVencimento = addDaysToDate(_dataEntrega, 45);
			// }else if(i === 1){
			// 	var _dataVencimento = addDaysToDate(_dataEntrega, 60);
			// }else if(i === 2){
			// 	var _dataVencimento = addDaysToDate(_dataEntrega, 90);
			// }

			$scope.kit.pagamentos.push({
				vlrPgto: _valorTotalDivida / _numeroParcelas,
				dataVencimento: _dataVencimento,
				formaPgto: 'Promissória'
			})
		};

	};


	var calcularValorTotalDivida = function(itens) {
		return valorTotalDivida = angular.copy(itens)
			.map(function(item){
				return ( parseInt(item.qtdeEntregue) - parseInt(item.qtdeDevolvida) ) * item.vlrUnit;
			})
			.reduce(function(soma, vlrTotal){
				return soma + vlrTotal;
			}, 0);
	};

	var calcularValorTotalKit = function(itens){
		return valorTotalKit = angular.copy(itens)
			.map(function(item){
				return parseInt(item.qtdeEntregue) * item.produtoCompleto.vlrCusto;
			})
			.reduce(function(soma, vlrTotal){
				return soma + vlrTotal;
			}, 0);
	};

	var addDaysToDate = function(date, days){
			var _data = new Date(date);
			return _data.setDate(_data.getDate() + days);
	}


	switch($location.path()){
		case '/kits':
			_loadKits();
			break;
		case '/gerar-kit':
			$scope.produto = {quantidade: 1};
			break;
		case '/entregar-kit':
			var _dataProxRetorno = new Date();
			_dataProxRetorno.setDate(_dataProxRetorno.getDate() + 25);
			$scope.kit.dataProxRetorno = _dataProxRetorno;
			$scope.kit.dataEntrega = new Date();
			_loadPessoas();
			break;
		case '/fechar-kit':
			$scope.produto = {quantidade: 1};
			$scope.kit.dataDevolucao = new Date();
			$scope.kit.numeroParcelas = 3;
			$scope.kit.vlrTotalDivida = calcularValorTotalDivida($scope.kit.itens);
			$scope.geraParamentos();
			break;
	}

});