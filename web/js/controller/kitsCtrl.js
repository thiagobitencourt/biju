var app = angular.module('bijuApp');

app.controller('kitsCtrl', function($rootScope, $scope, Restangular, singleFilter){

	var kitService = Restangular.service('kit');
	var produtoService = Restangular.service('produto');

	$scope.kit = {vlrTotalKit: 0};
	$scope.produto = {quantidade: 1};
	$scope.itens = [];

	$scope.kitsScopeProvider = {
		details: function(row){
			console.log(row.entity);
		}
	};

	$scope.kitsGridOptions = {
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
	    appScopeProvider: $scope.kitsScopeProvider,
	    rowTemplate: 'view/template-dblclick.html'
 	};

	$scope.kitsGridOptions.columnDefs = [
	    { name: 'codigo', displayName: 'Codigo'},
	    { name: 'vlrTotalKit', displayName: 'Valor Total'},
	    { name: 'estado', displayName: 'Estado'}
	];

	$scope.filter = function() {
		singleFilter.values($scope.filterValue, 
			['estado', 'codigo', 'vlrTotalKit']);
    	$scope.gridApi.grid.refresh();
  	};

	$scope.newKit = function(){
		console.log('novo kit');
	};

	var _loadKits = function(){
		$scope.kitsGridOptions.data = kitService.getList().$object;
	};

	_loadKits();

	$scope.inserirItem = function(produto){
		Restangular.one('produto').get({"q":{"referencia":produto.referencia}}).then( function(response){
			$scope.itens.push(
				{
					"produtoCompleto": response[0],
					"produto": response[0]._id,
					"qtdeEntregue" : produto.quantidade,
					"qtdeDevolvida" : 0,
					"vlrUnit" : response[0].vlrCusto,
					"vlrTotal" : produto.quantidade * response[0].vlrCusto
				}
			);
			
		});
	};

	$scope.saveKit = function(){

		var _kit = {};
		_kit.vlrTotalKit = 0

		angular.forEach($scope.itens, function(item){
			_kit.vlrTotalKit += item.vlrTotal;
		});

		_kit.itens = $scope.itens;
		_kit.estado = "Gerado";
		
		console.log(_kit);

		kitService.post(_kit).then(function(response){
			console.log(response);
			$rootScope.go('/kits');
		}, function(response){
			console.log(response);
		});
	};
});