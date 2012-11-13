(function(){
  'use strict';
  
  exports.Template = function( template ) {
    var _regex = /\/\*\s*template\s*([A-Za-z0-9\-_]+)\s*\*\//gm,
        _templates = {},
        _parts = template.split( _regex ).filter(function( s ){
          return s !== undefined && s.trim().length > 0;
        }).map(function( s ){
          return s.trim();
        });
        
    for( var i = 0; i < _parts.length; i+= 2 ) {
      _templates[ _parts[ i ] ] = _parts[ i + 1 ];
    }  
    
    this.literal = function( key, indentation ) {
      indentation = indentation === undefined ? 0 : indentation;
      
      var result = _templates[ key ];
      
      return indentation > 0 ? indent( result, indentation ) : result;
    };
    
    this.expand = function( key, value, indentation ) {
      indentation = indentation === undefined ? 0 : indentation;
      
      var result = _templates[ key ].inject( value );
      
      return indentation > 0 ? indent( result, indentation ) : result;
    };
    
    this.singleValue = function( key, property, value, indentation ) {
      indentation = indentation === undefined ? 0 : indentation;
      
      var obj = {};
      obj[ property ] = value;
      var result = _templates[ key ].inject( obj );
      
      return indentation > 0 ? indent( result, indentation ) : result;  
    };
    
    this.each = function( key, values, indentation ) {
      indentation = indentation === undefined ? 0 : indentation;
      
      var result = '';
      for( var i = 0; i < values.length; i++ ) {
        result += _templates[ key ].inject( values[ i ] );
      }
      
      return indentation > 0 ? indent( result, indentation ) : result;    
    };
  };

  function indent( lines, indentation ) {    
    return lines.split( '\n' ).map( function( s ) {
      return new Array( indentation + 1 ).join( ' ' ) + s;
    }).join( '\n' );
  }

  String.prototype.inject = function( obj ) {
    var text = this;
    for( var key in obj ) {
      if( obj.hasOwnProperty( key ) ) {
        var value = obj[ key ],
            keyToken = "{" + key + "}";
        while( text.match( keyToken ) ) {
          text = text.replace( keyToken, value );
        }
      }
    }
    return text;
  }; 
}());