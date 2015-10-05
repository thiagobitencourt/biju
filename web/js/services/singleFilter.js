var app = angular.module('bijuApp');
app.factory('singleFilter', function() {
  var _filterValue = '';
  var _columns;
  return {
    filter: function(renderableRows)
    {

      if(angular.isUndefined(_columns)){
        //Se as colunas não foram definidas, retorna não faz nada
        return renderableRows;
      }

      var matcher = new RegExp(_filterValue);
      renderableRows.forEach( function( row ) {
        var match = false;

        _columns.forEach(function( field ){
          if(angular.isDefined(row.entity[field]) && angular.isObject(row.entity[field])){
            var obj = row.entity[field];
            for(var attr in obj){
              if(angular.isDefined(obj[attr]) && typeof obj[attr] == 'string'){
                if(obj[attr].match(matcher)){
                  match = true;
                  break;
                }
              }
            }
          }else if(angular.isDefined(row.entity[field]) && row.entity[field].match(matcher)){
            match = true;
          }
        });
        if ( !match ){
          row.visible = false;
        }
      });

      _columns = undefined;
      return renderableRows;
    }, 
    values: function(filterValue, columns){
      //Define qual valor deve ser procuaro e em quais colunas
      _filterValue = filterValue;
      _columns = columns;
    }
  }
});