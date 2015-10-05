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

	$scope.gerarKitForm = function(){
		shareData.set('kit', { estado: $scope.estadosKit.NOVO, itens: [], vlrTotalKit: 0 });
		$rootScope.go('/gerar-kit');
	};

	$scope.entregarKitForm = function(){
		shareData.set('kit', $scope.kit);
		$rootScope.go('/entregar-kit');
	};

	$scope.fecharKitForm = function(){
		shareData.set('kit', $scope.kit);
		$rootScope.go('/fechar-kit');
	};

	$scope.gerarKit = function(){

		var _kit = $scope.kit;
		_kit.estado = $scope.estadosKit.GERADO;
		
		kitService.post(_kit).then(function(response){
			$rootScope.go('/kits');
		}, function(response){
			console.log(response);
		});

	};

	$scope.entregarKit = function(){

		var _kit = $scope.kit;
		_kit.estado = $scope.estadosKit.ENTREGUE;

		_kit.put().then(function(response){
			$rootScope.go('/kits');
		}, function(response){
			console.log('erro ao atualizar kit');
		});
	};


	$scope.fecharKit = function(){

		var _kit = $scope.kit;
		_kit.estado = $scope.estadosKit.FECHADO;

		var _vlrTotalDivida = 0;

		angular.forEach(_kit.itens, function(item){
			_vlrTotalDivida += ( parseInt(item.qtdeEntregue) - parseInt(item.qtdeDevolvida) ) * item.vlrUnit;
		});

		_kit.vlrTotalDivida = _vlrTotalDivida;

		_kit.put().then(function(response){
			$rootScope.go('/kits');
		}, function(response){
			console.log('erro ao atualizar kit');
		});
	};

	$scope.inserirItem = function(produto){
		Restangular.one('produto').get({"q":{"referencia":produto.referencia}}).then( function(response){
			var _vlrTotal = produto.quantidade * response[0].vlrCusto;
			$scope.kit.itens.push(
				{
					"produtoCompleto": response[0],
					"produto": response[0]._id,
					"qtdeEntregue" : produto.quantidade,
					"qtdeDevolvida" : 0,
					"vlrUnit" : response[0].vlrCusto,
					"vlrTotal" : _vlrTotal
				}
			);

			$scope.kit.vlrTotalKit += _vlrTotal;
			$scope.produto = {quantidade: 1};
			focus('referencia');
		}, function(error){
			//@TODO tratar erro se o produto nao existe
			console.log(error);
		});
	};

	//@TODO remover um item da tabela
	$scope.removerItem = function(){

	};

	$scope.devolverItem = function(produto){
		angular.forEach($scope.kit.itens, function(item){
			if(item.produto.referencia === produto.referencia){
				if(produto.quantidade <= item.qtdeEntregue){
					item.qtdeDevolvida = produto.quantidade;
				}else{
					console.log('nao e possivel devolver quantidade maior que entregue');
				}
			}
		});
		$scope.produto = {quantidade: 1};
	};


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
			break;
	}

});