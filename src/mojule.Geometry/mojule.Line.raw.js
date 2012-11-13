mojule.Line = function (){
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