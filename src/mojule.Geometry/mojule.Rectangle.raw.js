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