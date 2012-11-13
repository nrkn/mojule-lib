(function(){
  'use strict';
  //if you need more than this consider https://github.com/caolan/async instead
  var process = function( queue, callback ) {
    if( queue.length > 0 ) {
      var item = queue.pop();
      item( function(){
        process( queue, callback );  
      });
      return;
    }
    if( callback ) {
      callback();
    }
  };

  exports.process = process;
}());  