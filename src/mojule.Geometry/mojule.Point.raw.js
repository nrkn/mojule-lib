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