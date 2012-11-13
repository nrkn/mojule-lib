// If data.value is not defined use the getter, otherwise use the setter
function getOrSet( data ) {
  if( data.value !== undefined && data.value.length > 0 ) {
    return data.setter();
  }
  return data.getter();    
}

//initialize a new geometry item
function init( instance, Type, args ) {
  //mojule.Geometry class constructors should have a mapping for themselves
  instance.clone = function() {
    return new Type( instance );
  };
  
  instance.toString = function() {
    //return _( instance ).getPropertyValues( mojule[ Type2 ].properties ).join( ',' );
    return _( instance ).getPropertyValues( Type.properties ).join( ',' );
  };
  
  instance.equals = function() {
    var obj = _( arguments ).toObject( Type );
    return _( instance ).equals( obj, Type.properties );
  };   

  instance.almostEquals = function() {
    var obj = _( arguments ).toObject( Type ); 
    return _( instance ).almostEquals( obj, Type.properties );
  };  
  
  //initialize properties to zero
  _( Type.properties ).each( function( e ) {
    instance[ e ] = 0;
  });
  
  Type.mapper.map( instance, args );
  
  _.addMath( instance, Type.properties ); 
}

//default string and arguments mappers
var strRegExp = /[+\-]?(?:\d+\.?\d*|\d*\.?\d+)/g;

function predicateFromOption( type, option ) {
  if( option.aliases !== undefined ) {
    var aliases = option.aliases;
    return function( value ) {
      var values = [];
      _( type.properties ).each( function( property ) {
        values.push( value[ property ] );
        if( aliases[ property ] !== undefined ) {
          values.push( value[ aliases[ property ] ] );
        }
      });
      return _( values ).anyDefined();
    };
  }
  
  if( _( [ option.properties, option.map ] ).allDefined() ) {
    return function( value ) {
      return _( value ).hasAllProperties !== undefined && _( value ).hasAllProperties( option.properties );
    };
  }
  
  if( option.copy !== undefined ) {
    return function( value ) {
      return _( value ).hasAllProperties !== undefined && _( value ).hasAllProperties( option.copy );
    };
  }
  
  //default
  return function() {
    return false;
  };
}

function mapFromOption( type, option ) {
  if( option.aliases !== undefined ) {
    var aliases = option.aliases;
    return function( value, obj ) {      
      _( type.properties ).each( function( property ) {
        var values = [ value[ property ] ];
        if( aliases !== undefined && aliases[ property ] !== undefined ) {
          values.push( value[ aliases[ property ] ] );
        } 
        values.push( obj[ property ] );                      
        obj[ property ] = parseFloat( _( values ).firstDefined() );                      
      });                 
      return obj;
    };
  }
  
  if( _( [ option.properties, option.map ] ).allDefined() ) {
    return function( value, obj ) {
      option.map( value, obj );
      return obj;
    };
  }
  
  if( option.copy !== undefined ) {
    return function( value, obj ) {
      _( option.copy ).each( function( property ) {
        obj[ property ] = value[ property ];
      });
      return obj;
    };
  }
  
  //default
  return function( value, obj ) {
    return obj;
  };
}

//tbh might be better to have the options stuff in mapper - consider later kk
function defaultMappings( type, options ) {
  var mappings = {
    args: { 
      predicate:  function( value ) {
                    return value instanceof Array && value.length > 1 && _( value ).allOfType( 'number' );
                  },
      map:        function( value, obj ) {
                    _( type.properties ).each( function( e, i ) {
                      obj[ e ] = value.length > i ? parseFloat( value[ i ] ) : obj[ e ];
                    });
                    return obj;            
                  }
    },    
    str: {      
      predicate:  function( value ) {
                    return typeof value === 'string' && value.match( strRegExp ).length > 0;
                  },
      map:        function( value, obj ) {      
                    var matches = value.match( strRegExp );
                    _( type.properties ).each( function( e, i ) {
                      obj[ e ] = matches.length > i ? parseFloat( matches[ i ] ) : obj[ e ];
                    });
                    return obj;            
                  }
    }                  
  };
  _( options ).each( function( option, key ) {
    mappings[ key ] = {
      predicate: predicateFromOption( type, option ),
      map:       mapFromOption( type, option )
    };
  });
  return mappings;
}