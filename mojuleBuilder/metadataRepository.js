(function(){
  'use strict';
  var fs = require( 'fs' );

  exports.load = function( settingsFile ) {
    var json = fs.readFileSync( settingsFile, 'utf-8' ),
        data = JSON.parse( json );
        
    return new MetadataRepository( data );
  }

  function MetadataRepository( data ) {
    this.name = data !== undefined && data.name !== undefined ? data.name : '';
    this.version = data !== undefined && data.version !== undefined ? data.version : '';
    this.description = data !== undefined && data.description !== undefined ? data.description : '';
    this.modules = data !== undefined && data.modules !== undefined ? data.modules : [];
    
    this.save = function( settingsFile ) {  
      var json = JSON.stringify( this, null, 2 );
      fs.writeFileSync( settingsFile, json );
    } 
    
    this.bumpVersions = function() {
      bumpVersion( this );
      for( var i = 0; i < this.modules.length; i++ ) {
        bumpVersion( this.modules[ i ] );
      }
    }

    function bumpVersion( metadata ) {
      var parts = metadata.version.split( '.' ),
          end = ( parts[ parts.length - 1 ] * 1 ) + 1;
      
      metadata.version = parts[ 0 ] + '.' + parts[ 1 ] + '.' + end;
    }
  }

  exports.MetadataRepository = MetadataRepository;
}());  