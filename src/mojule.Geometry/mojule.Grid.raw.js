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