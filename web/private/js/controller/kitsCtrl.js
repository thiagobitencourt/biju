var app = angular.module('bijuApp');

app.controller('kitsCtrl', function($rootScope, $scope, $location, $filter, $modal, Restangular, singleFilter, shareData, focus){

	if(shareData.has('kit')){
		$scope.kit = shareData.get('kit');
		shareData.remove('kit');
	}

	var kitService = Restangular.service('kit');
	var produtoService = Restangular.service('produto');
	var pessoaService = Restangular.service('pessoa');

	var removeKit = function(kit){
		kit.remove().then(function(result){
			$rootScope.go('/kits');
		});
	}

	$scope.cadastrarProduto = function(){
		shareData.set('saveRef', $scope.produto.referencia);
		$location.path('/produtos');
	};

	$scope.excluirKit = function(kit){
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'view/Kit/kit-modal-remove-confirm.html',
			resolve: {
        rm: {remove: removeKit, kit: kit}
      },
			controller: function($scope, $modalInstance, rm){
				$scope.remove = function () {
					$modalInstance.dismiss('cancel');
			    rm.remove(rm.kit);
			  };
			  $scope.close = function () {
			    $modalInstance.dismiss('cancel');
			  };
			}
		});
	}

	$scope.setRelKitConfig = function(){
		shareData.set('relKitsConfig', {
	    pessoaId : 'todas',
	    kitId : $scope.kit._id,
	    estado : 'todos'
	  });
	}

	$scope.estadosKit =
		{NOVO: 'Novo',
		GERADO:'Gerado',
		ENTREGUE:'Entregue',
		FECHADO:'Fechado',
		PAGO:'Pago',
	};

	$scope.kitsScopeProvider = {
		details: function(row){
			shareData.set('kit',row.entity);
			$rootScope.go('/detalhes-kit');
		}
	};

	$scope.kitsGridOptions = {
	    paginationPageSizes: [20, 50, 100],
    	paginationPageSize: 50,
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
			{ name: 'codigoPersonalizado', displayName: 'kit'},
    	{ name: 'pessoa.codigo', displayName: 'Pasta'},
    	{ name: 'pessoa.nome', displayName: 'Cliente'},
	    { name: 'dataProxRetorno', cellFilter:"date:'dd/MM/yyyy'", displayName: 'Data Prox. Retorno'},
	    { name: 'vlrTotalKit', cellFilter:'currency', displayName: 'Total Kit'},
	    { name: 'vlrTotalDivida', cellFilter:'currency', displayName: 'Total Venda'},
	    { name: 'vlrTotalPgto', cellFilter:'currency', displayName: 'Total Pagamento'},
	    { name: 'estado', displayName: 'Estado', cellTemplate: 'view/Kit/kit-template-estado.html'}
	];

	$scope.filter = function() {
		singleFilter.values($scope.filterValue,
			['estado', 'codigo', 'pessoa', 'referencia', 'nome', 'codigoPersonalizado']);
  	$scope.gridApi.grid.refresh();
	};

	var _loadKits = function(){
		$scope.kitsGridOptions.data = kitService.getList().$object;
	};

	var _loadPessoas = function(){
		$scope.pessoas = pessoaService.getList().$object;
	};

	$scope.kitForm = function(action){
		if(action === 'gerar'){
			shareData.set('kit', { estado: $scope.estadosKit.NOVO, itens: [], vlrTotalKit: 0 });
		}else{
			shareData.set('kit', $scope.kit);
		}
		//@TODO corregir com servico para direcionamento
		$rootScope.go('/'+action+'-kit');
	};

	$scope.saveError = null;
	$scope.kitSave = function(estado){
		var _kit = $scope.kit;

		//@TODO corregir logica melhorar condicao quando e pago
		if(angular.isDefined(estado)){
			_kit.estado = $scope.estadosKit[estado];
		}else if(_kit.vlrTotalDivida === _kit.vlrTotalPgto){
			_kit.estado = $scope.estadosKit.PAGO;
		}

		try{
			if(angular.isObject(_kit.pessoa)){
				_kit.pessoa = _kit.pessoa._id;
			}else{
				try{
					_kit.pessoa = angular.fromJson(_kit.pessoa)._id;
				}catch(e){
					console.log('error Macabro...');
				}
			}
		}catch(e){
			console.log('error Macabro 2...');
		}

		if(angular.isUndefined(_kit._id)){
			kitService.post(_kit).then(function(response){
				localStorage.removeItem('tempKit');
				$rootScope.go('/kits');
			}, function(response){
				// @TODO enviar erro ao gerar kit para view
				$scope.saveError = response.data.message;
				console.log('erro ao gerar kit', response.data.message);
				console.log(response);
			});
		}else{
			_kit.put().then(function(response){
				localStorage.removeItem('tempKit');
				$rootScope.go('/kits');
			}, function(response){
				// @TODO enviar erro ao gerar kit para view
				$scope.saveError = response.data.message;
				console.log('erro ao atualizar kit', response.data.message);
			});
		}
	};

	// referente a funcionalidade de focus inputs e enter
	var referenciaFocus = true;
	var quantidadeFocus = false;
	focus('referencia');

	$scope.setFocus = function(pr, next){
		if(referenciaFocus === true){
			referenciaFocus = false;
			quantidadeFocus = true;
			focus('quantidade');
			return;
		}else if(quantidadeFocus === true){
			quantidadeFocus = false;
			referenciaFocus = true;
			focus('referencia');
			next(pr);
		}
	}

	$scope.inserirItem = function(produto){

		if(isNaN(produto.quantidade)){
			focus('quantidade');
			$scope.errorProdutoMessage = 'Quantidade deve ser número';
			return;
		}
		$scope.errorProdutoMessage = false;

		if(angular.isDefined(produto.referencia)){
			var produtoExistente = false;
			angular.forEach($scope.kit.itens, function(item){
				if(item.produtoCompleto.referencia === produto.referencia){
					item.qtdeEntregue = parseInt(item.qtdeEntregue) + parseInt(produto.quantidade);
					item.vlrTotal = parseFloat(item.produtoCompleto.vlrCusto) * parseInt(item.qtdeEntregue);
					$scope.kit.vlrTotalKit = calcularValorTotalKit($scope.kit.itens);
					produtoExistente = true;
					$scope.errorProdutoMessage = false;

					$scope.produto = {quantidade: 1};
					quantidadeFocus = false;
					referenciaFocus = true;
					focus('referencia');
				}
			});

			if(!produtoExistente){
				Restangular.one('produto').get({"q":{"referencia":produto.referencia}})
				.then( function(response){
					if(response.length > 0){
						// $scope.kit.itens.push(
						$scope.kit.itens.unshift(
							{
								"produtoCompleto": response[0],
								"produto": response[0]._id,
								"qtdeEntregue" : produto.quantidade,
								"qtdeDevolvida" : 0,
								"vlrUnit" : response[0].vlrCusto,
								"vlrTotal" : parseFloat(response[0].vlrCusto) * parseInt(produto.quantidade)
							}
						);
						$scope.produto = {quantidade: 1};
						$scope.kit.vlrTotalKit = calcularValorTotalKit($scope.kit.itens);
						$scope.errorProdutoMessage = false;
						focus('referencia');
					}else{
						$scope.errorProdutoMessage = "Referencia Produto Não Existe!";
					}
				}, function(error){
					$scope.errorProdutoMessage = "Referencia Produto Não Existe!";
				});
			}

		localStorage.setItem('tempKit', angular.toJson($scope.kit));

		}else{
			$scope.errorProdutoMessage = "Referencia Produto Não Existe!";
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
		if(angular.isDefined(produto.referencia)){
			angular.forEach($scope.kit.itens, function(item){
				if(item.produto.referencia === produto.referencia){
					if((produto.quantidade <= item.qtdeEntregue) && item.qtdeDevolvida !== item.qtdeEntregue){
						item.qtdeDevolvida = parseInt(item.qtdeDevolvida) + parseInt(produto.quantidade);
						$scope.errorProdutoMessage = false;
						$scope.produtoAvailableDescription = false;
					}else{
						$scope.errorProdutoMessage = "Valor Maior Entregue!";
						$scope.produtoAvailableDescription = false;
					}
				}
			});
			$scope.produto = {quantidade: 1};
			$scope.kit.vlrTotalDivida = calcularValorTotalDivida($scope.kit.itens);
			$scope.geraParamentos();
		}else{
			$scope.errorProdutoMessage = "Referencia Produto Não Existe!";
			$scope.produtoAvailableDescription = false;
		}
	};

	$scope.zerarQtdDevolvida = function(item){
		item.qtdeDevolvida = 0;
		$scope.kit.vlrTotalDivida = calcularValorTotalDivida($scope.kit.itens);
		$scope.geraParamentos();
	};

	//@TODO corregir com validator Form do angular
	$scope.checkPessoa = function(){
		return angular.isUndefined($scope.kit.pessoa);
	};

	$scope.somarTotal = function(valor){
		if(($scope.kit.vlrTotalPgto + valor) <= $scope.kit.vlrTotalDivida){
			$scope.kit.vlrTotalPgto += valor;
			$scope.pagarValor = 0;
			$scope.errorPagar = false;
		}else{
			$scope.errorPagar = "Operação invalida!";
		}
	};

	$scope.subtrairTotal = function(valor){
		if($scope.kit.vlrTotalPgto >= valor){
			$scope.kit.vlrTotalPgto -= valor;
			$scope.pagarValor = 0;
			$scope.errorPagar = false;
		}else{
			$scope.errorPagar = "Operação invalida!";
		}
	};

	$scope.geraParamentos = function(){
		$scope.kit.pagamentos = [];

		var _numeroParcelas = parseInt(angular.copy($scope.kit.numeroParcelas));
		var _valorTotalDivida = angular.copy($scope.kit.vlrTotalDivida);
		var _dataEntrega = angular.copy($scope.kit.dataDevolucao);
		var _dataVencimento = new Date(_dataEntrega);

		for (var i = 0; i < _numeroParcelas; i++) {
			if(i === 0){
				_dataVencimento = new Date(_dataVencimento.addDays(45));
			}else {
				_dataVencimento = new Date(_dataVencimento.addDays(30));
			}
			$scope.kit.pagamentos.push({
				vlrPgto: _valorTotalDivida / _numeroParcelas,
				dataVencimento: angular.copy(_dataVencimento),
				formaPgto: 'Promissória'
			})
		};
	};

	$scope.modalEditKit = function(){
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'view/Kit/kit-modal-edit-confirm.html',
			resolve: {
        kitForm: function () {
          return $scope.kitForm;
        }
      },
			controller: function($scope, $modalInstance, kitForm){
				$scope.edit = function () {
					$modalInstance.dismiss('cancel');
			    kitForm('editar');
			  };
			  $scope.close = function () {
			    $modalInstance.dismiss('cancel');
			  };
			}
		});
	};

	$scope.modalSaveKit = function(estado){
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'view/Kit/kit-modal-save-confirm.html',
			resolve: {
        kitSave: function () {
          return $scope.kitSave;
        }
      },
			controller: function($scope, $modalInstance, kitSave){
				$scope.save = function () {
					$modalInstance.dismiss('cancel');
			    kitSave(estado.toUpperCase());
			  };
			  $scope.close = function () {
			    $modalInstance.dismiss('cancel');
			  };
			}
		});
	};

	$scope.atualizarEditKit = function(){
		$scope.kit.vlrTotalKit = calcularValorTotalKitEditando($scope.kit.itens);
		$scope.kit.vlrTotalDivida = calcularValorTotalDivida($scope.kit.itens);
		$scope.geraParamentos();
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

	// @TODO modificar a logica do produtoCompleto
	var calcularValorTotalKitEditando = function(itens){
		return valorTotalKit = angular.copy(itens)
			.map(function(item){
				return parseInt(item.qtdeEntregue) * item.produto.vlrCusto;
			})
			.reduce(function(soma, vlrTotal){
				return soma + vlrTotal;
			}, 0);
	};

	$scope.cancel = function(){
		localStorage.removeItem('tempKit');
		$rootScope.go('/kits');
	}

	$scope.evalDataRetorno = function(){
		try{
			var _dataProxRetorno = new Date();
			//TODO: Dias para o próximo retorno (30) deverá ser uma variável
			_dataProxRetorno.setDate($scope.kit.dataEntrega.getDate() + 30);
			$scope.kit.dataProxRetorno = _dataProxRetorno;
		}catch(e){

		}
	}

	switch($location.path()){
		case '/kits':
			_loadKits();
			break;
		case '/editar-kit':
			_loadPessoas();
			console.log($scope.kit.pessoa);
			if($scope.kit.pessoa){
				$scope.kit.pessoa = $scope.kit.pessoa.nome;
			}
			$scope.kit.numeroParcelas = 3;
			break;
		case '/gerar-kit':
			$scope.produto = {quantidade: 1};

			var oldKit = angular.fromJson(localStorage.getItem('tempKit'));
			if(oldKit)
				$scope.kit = oldKit;

			break;
		case '/entregar-kit':
			$scope.kit.dataEntrega = new Date();
			var _dataProxRetorno = new Date();
			_dataProxRetorno.setDate($scope.kit.dataEntrega.getDate() + 30);
			$scope.kit.dataProxRetorno = _dataProxRetorno;
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
