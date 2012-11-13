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