/*!
 * Geometry 0.0.231
 * Geometry objects
 * http://mojule.co.nz/
 *
 * Copyright 2011, Information Age Ltd
 * Licensed under the MIT License
 *
 * Date: 2012-07-16 11:18:53Z
 */

//  Declare but don't overwrite mojule if it already exists - this way parts of 
//  mojule can be added in any order or combination
var mojule = mojule === undefined ? {} : mojule;

(function(){
  'use strict';
  
  var _ = mojule.Extensions;
  // If data.value is not defined use the getter, otherwise use the setter
  function getOrSet( data ) {
    if( data.value !== undefined && data.value.length > 0 ) {
      return data.setter();
    }
    return data.getter();    
  }
  
  //initialize a new geometry item
  function init( instance, Type, args ) {
    //DEBUG REMOVE
    var Type2 = instance.constructor.name;
    console.log( Type2 );
    
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
  // Point Constructor
  mojule.Point = function(){
    //private vars
    var self = this;
   
    init( self, mojule.Point, arguments );
  
    this.unitVector = function() {
      return new Point( self.x / self.length(), self.y / self.length() );
    };
    
    //length as vector
    this.length = function() {
      return getOrSet({
        value: arguments,
        setter: function(){        
          var adjusted = self.unitVector(),
              len = _( this.value ).toValue();
          self.x = adjusted.x * len;
          self.y = adjusted.y * len;
          
          return self;
        },
        getter: function() {
          return Math.sqrt( ( self.x * self.x + self.y * self.y ) );        
        }
      });  
    };
    
    this.scale = function( multiplier ) {
      self.x = self.x * multiplier;
      self.y = self.y * multiplier;
      
      return self;
    };
    
    this.translate = function() {
      var point = _( arguments ).toObject( mojule.Point );
      self.x += point.x;
      self.y += point.y;
      
      return self;
    };    
    
    this.rotate = function() {
      if( arguments.length < 1 ) {
        return self;
      }
      
      var degrees = arguments[ 0 ],
          origin = arguments.length > 1 ? _( arguments ).toValue().slice( 1 ) : undefined,
          radians = _( parseFloat( degrees ) ).toRadians();
      
      if( origin !== undefined ) {
        origin = new mojule.Point( origin );      
        self.translate( new mojule.Point( origin.x * -1, origin.y * -1 ) );
      }
      
      var newX = ( self.x * Math.cos( radians ) - self.y * Math.sin( radians ) ),
          newY = ( self.x * Math.sin( radians ) + self.y * Math.cos( radians ) );
      
      self.x = newX;
      self.y = newY;      
      
      if( origin !== undefined ) {
        self.translate( origin );
      }
      
      return self;
    };
    
    this.lineTo = function() {
      var pointTo =  _( arguments ).toObject( mojule.Point );
      return new mojule.Line( self, pointTo );
    };  
        
    this.lineFrom = function() {
      var pointFrom = _( arguments ).toObject( mojule.Point );
      return new mojule.Line( pointFrom, self );
    };
    
    this.neighbours = function() {
      return [
        new mojule.Point( self.x, self.y - 1 ),
        new mojule.Point( self.x, self.y + 1 ),
        new mojule.Point( self.x - 1, self.y ),
        new mojule.Point( self.x + 1, self.y )
      ];
    };
    
    this.wrap = function() {
      var size = new mojule.Size( arguments );
      
      self.x = _( self.x ).wrap( size.width );
      self.y = _( self.y ).wrap( size.height );
      
      return self;
    };
  };  
  
  mojule.Point.properties = [ 'x', 'y' ];
  
  mojule.Point.mapper = new mojule.Mapper( 
    defaultMappings( 
      mojule.Point, 
      {
        line: {
          properties: [ 'x1', 'y1', 'x2', 'y2' ],
          map: function( value, point ) {
            point.x = Math.max( value.x1, value.x2 ) - Math.min( value.x1, value.x2 );
            point.y = Math.max( value.y1, value.y2 ) - Math.min( value.y1, value.y2 );
          }        
        },
        
        rectangleOrSize: {
          aliases: {
            x: 'width',
            y: 'height'
          }
        },
        
        rectangle2: {
          properties: [ 'left', 'top', 'right', 'bottom' ],
          map: function( value, point ) {
            point.x = Math.max( value.left, value.right ) - Math.min( value.left, value.right );
            point.y = Math.max( value.top, value.bottom ) - Math.min( value.top, value.bottom );
          }
        },
        
        leftTop: {
          aliases: {
            x: 'left',
            y: 'top'
          }
        }           
      } 
    ) 
  );
  mojule.Line = function MojuleLine(){
    var self = this;
    
    init( self, mojule.Line, arguments );
    
    this.start = function() {            
      return getOrSet({
        value: arguments,
        setter: function(){
          var point = _( this.value ).toObject( mojule.Point );
          self.x1 = point.x;
          self.y1 = point.y;
          
          return self;
        },
        getter: function() {
          return new mojule.Point( self.x1, self.y1 );
        }
      });
    };
    
    this.end = function() {
      return getOrSet({
        value: arguments,
        setter: function(){
          var point = _( this.value ).toObject( mojule.Point );
          self.x2 = point.x;
          self.y2 = point.y;
          
          return self;
        },
        getter: function() {
          return new mojule.Point( self.x2, self.y2 );
        }
      });    
    };
    
    this.verticals = function() {
      return [ self.x1, self.x2 ];
    };
  
    this.horizontals = function() {
      return [ self.y1, self.y2 ];
    };
    
    this.points = function() {
      return [ self.start(), self.end() ];
    };
    
    this.bresenham = function() {
      var line = self.clone().round(),
          differenceX = _( line.end().x ).difference( line.start().x ),
          differenceY = _( line.end().y ).difference( line.start().y ),
          stepX = _( line.start().x ).step( line.end().x ),
          stepY = _( line.start().y ).step( line.end().y ),
          error = differenceX - differenceY,
          current = line.start(),
          points = [];
      
      while( true ) {
        points.push( current.clone() );
        if( current.equals( line.end() ) ) {
          break;
        }
        
        var error2 = 2 * error;
        
        if( error2 > -differenceY ) {
          error -= differenceY;
          current.x += stepX;
        }
        
        if( error2 >= differenceX ) {
          continue;
        }
        
        error += differenceX;
        current.y += stepY;
      }      
      
      return points;
    };
    
    //todo - control line rotate around start or origin or 0,0
    this.rotate = function() {
      self.start( self.start.rotate( arguments ) );
      self.end( self.end.rotate( arguments ) );
      
      return self;
    };
    
    this.translate = function() {
      var point = _( arguments ).toObject( mojule.Point );
      
      self.start( self.start().translate( point ) );
      self.end( self.end().translate( point ) );
      
      return self;
    };
  };
  
  mojule.Line.properties = [ 'x1', 'y1', 'x2', 'y2' ];
  
  mojule.Line.mapper = new mojule.Mapper([
    defaultMappings( 
      mojule.Line,
      {
        point: {
          aliases: {
            x2: 'x',
            y2: 'y'
          }
        },
        
        sizeOrRectangle: {
          properties: [ 'width', 'height' ],
          map: function( value, line ) {
            var x = value.x !== undefined ? value.x : 0,
                y = value.y !== undefined ? value.y : 0;
            line.x1 = x;
            line.y1 = y;
            line.x2 = x + value.width;
            line.y2 = y + value.height;
          }
        }
      }
    ),
    {
      points: {
        predicate:  function( value ) {       
                      return value instanceof Array && value.length > 1 && _( [ value[ 0 ].x, value[ 0 ].y ] ).anyDefined() && _( [ value[ 1 ].x, value[ 1 ].y ] ).anyDefined();
                    }, 
        map:        function( value, line ) {
                      line.x1 = parseFloat( value[ 0 ].x );
                      line.y1 = parseFloat( value[ 0 ].y );
                      line.x2 = parseFloat( value[ 1 ].x );
                      line.y2 = parseFloat( value[ 1 ].y );
                      return line;
                    }      
      }
    }
  ]);
  // Size Constructor
  mojule.Size = function(){
    //private vars
    var self = this;  
    init( self, mojule.Size, arguments );
  };
  
  mojule.Size.properties = [ 'width', 'height' ];
  
  mojule.Size.mapper = new mojule.Mapper([
    defaultMappings( 
      mojule.Size,
      {
        point: {
          aliases: {
            width: 'x',
            height: 'y'
          }
        },
        
        line: {
          properties: [ 'x1', 'y1', 'x2', 'y2' ],
          map: function( value, size ) {
            size.width =  Math.max( value.x1, value.x2 ) - Math.min( value.x1, value.x2 );
            size.height = Math.max( value.y1, value.y2 ) - Math.min( value.y1, value.y2 );
          }
        },
        
        rectangle: {
          copy: [ 'width', 'height' ]
        },
        
        rectangle2: {
          properties: [ 'left', 'right', 'top', 'bottom' ],
          map: function( value, size ) {
            size.width = Math.max( value.left, value.right ) - Math.min( value.left, value.right );
            size.height = Math.max( value.top, value.bottom ) - Math.min( value.top, value.bottom );
          }
        }
      }
    )
  ]);
  // this would be better as x,y rather than left, top - then left/top as funcitons, more consistent - but x,y breaks test for point in mapper so fix that first
  // Rectangle Constructor
  mojule.Rectangle = function(){
    //private vars
    var self = this; 
    init( self, mojule.Rectangle, arguments );
    
    //chnage to get/set
    this.right = function() {
      return self.left + self.width;
    };
    
    //chnage to get/set
    this.bottom = function() {
      return self.top + self.height;
    };
    
    this.inBounds = function() {
      var point = new mojule.Point( _( arguments ).toValue() );
      return point.x >= self.left && point.x <= self.right() && point.y >= top && point.y <= self.bottom();
    };
  };
  
  mojule.Rectangle.properties = [ 'left', 'top', 'width', 'height' ];
  
  function mapFromValues( rectangle, x1, y1, x2, y2 ) {
    var x = Math.min( x1, x2 ),
        y = Math.min( y1, y2 );
    rectangle.left = x;
    rectangle.top = y;
    rectangle.width = Math.max( x1, x2 ) - x;
    rectangle.height = Math.max( y1, y2 ) - y;
  }
  
  mojule.Rectangle.mapper = new mojule.Mapper([
    defaultMappings( 
      mojule.Rectangle, 
      {
        rectangle3: {
          properties: [ 'x', 'y', 'width', 'height' ],
          map: function( value, rectangle ) {
            rectangle.width = value.width;
            rectangle.height = value.height;
          }  
        },
        
        point: {
          aliases: {
            left: 'x',
            top: 'y'
          }
        },
        
        line: {
          properties: [ 'x1', 'y1', 'x2', 'y2' ],
          map: function( value, rectangle ) {
            mapFromValues( rectangle, value.x1, value.y1, value.x2, value.y2 );
          }
        },
        
        size: {
          copy: [ 'width', 'height' ]
        },
        
        rectangle2: {
          properties: [ 'left', 'right', 'top', 'bottom' ],
          map: function( value, rectangle ) {
            mapFromValues( rectangle, value.left, value.top, value.right, value.bottom );
          }      
        }      
      }
    )
  ]);
  // Grid Constructor
  mojule.Grid = function(){
    //private vars
    var self = this,
        _cells = [],
        _rows = [],
        _columns = [],
        _size = new mojule.Size();
    
    function _get( x, y ) {
      return _cells[ _2dTo1d( x, y ) ];
    }  
    
    function _set( x, y, value ) {
      _cells[ _2dTo1d( x, y ) ] = value;
      
      if( _rows[ y ] === undefined ) {
        _rows[ y ] = [];
      }
      _rows[ y ][ x ] = value;
      
      if( _columns[ x ] === undefined ) {
        _columns[ x ] = [];
      }
      _columns[ x ][ y ] = value;
      
      return self;
    }
    
    function _2dTo1d( x, y ) {
      return y * _size.width + x;
    }
    
    function cellsToColumns() {
      _columns = [];
      for( var x = 0; x < _size.width; x++ ) {
        var column = [];
        for( var y = 0; y < _size.height; y++ ) {
          column.push( _get( x, y ) );
        }
        _columns.push( column );
      }
      return _columns;    
    }
    
    function cellsToRows() {
      _rows = _( self.cells() ).chunk( _size.width );
    }
    
    this.get = function(){
      //testing should be faster than newing up a point
      if( arguments.length > 1 && typeof arguments[ 0 ] === 'number' && typeof arguments[ 1 ] === 'number' ) {
        return _get( arguments[ 0 ], arguments[ 1 ] ); 
      }
      if( arguments.length === 1 && arguments[ 0 ].x !== undefined && arguments[ 0 ].y !== undefined ) {
        return _get( arguments[ 0 ].x, arguments[ 0 ].y );
      }
      
      var point = new mojule.Point( arguments );
      return _get( point.x, point.y );
    };
    
    this.set = function() {
      if( arguments.length < 2 ) {
        return;
      }
      var value = arguments[ 0 ],
          x, y;
          
      //testing should be faster than newing up a point
      if( arguments.length > 2 && typeof arguments[ 1 ] === 'number' && typeof arguments[ 2 ] === 'number' ) {
        return _set( value, arguments[ 1 ], arguments[ 2 ] );
      }
      if( arguments.length === 2 && arguments[ 1 ].x !== undefined && arguments[ 1 ].y !== undefined ) {
        return _set( value, arguments[ 1 ].x, arguments[ 1 ].y );
      }    
      
      var point = new mojule.Point( _( arguments ).toValue().slice( 1 ) );    
      return _set( value, point.x, point.y );
    };
    
    this.each = function( func ) {
      for( var y = 0; y < _size.height; y++ ) {
        for( var x = 0; x < _size.width; x++ ) {
          func( _get( x, y ), x, y, _size.width, _size.height );
        }
      }
      
      return self;
    };
    
    this.setEach = function( func ) {
      for( var y = 0; y < _size.height; y++ ) {
        for( var x = 0; x < _size.width; x++ ) {        
          _set( x, y, func( x, y, _get( x, y ), _size.width, _size.height ) );
        }
      }
      
      return self;
    };
    
    this.cells = function(){
      return getOrSet({
        value: arguments,
        setter: function(){
          _cells = _( this.value ).toValue();
          cellsToColumns();
          cellsToRows();
          
          return self;
        },
        getter: function() {
          return _cells.slice( 0 );
        }
      });    
    };
    
    this.size = function(){
      return _size.clone();
    };
    
    this.clone = function(){
      var grid = new Grid( _size );
      grid.cells( self.cells() );
      return grid;
    };
    
    this.toString = function( converter ){
      if( converter !== undefined && converter instanceof Function ) {
        return _size.toString() + ',' + _cells.map( converter ).join( ',' );
      }
      return _size.toString() + ',' + JSON.stringify( _cells );
    };
    
    this.equals = function( grid ) {
      return _size.equals( grid.size() ) && _( _cells ).elementsEqual( grid.cells() );
    };
    
    this.bounds = function() {
      return new Rectangle( _size );
    };
    
    this.rows = function() {
      return _rows.slice( 0 );
    };
    
    this.columns = function() {
      return _columns.slice( 0 );
    };
    
    //perhaps we do need to use a mapper for grid - todo consider
    var args = _( arguments ).toValue();
    //duck test for html5 canvas ImageData
    if( args !== null && _( [ args.width, args.height, args.data ] ).allDefined() ) {
      _size = new mojule.Size( args.width, args.height );
      _cells = _( args.data ).chunk( 4 );
    } else {  
      mojule.Size.mapper.map( _size, arguments );
      _size.ceil().abs();
    }
  };
}());

//  Aliases
var Point = Point === undefined ? mojule.Point : Point,
    Line = Line === undefined ? mojule.Line : Line,
    Size = Size === undefined ? mojule.Size : Size,
    Rectangle = Rectangle === undefined ? mojule.Rectangle : Rectangle,
    Grid = Grid === undefined ? mojule.Grid : Grid;