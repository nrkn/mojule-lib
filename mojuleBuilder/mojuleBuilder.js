//todo
//  get rid of sync in components
//  indent as a function is horrible (and it's repeated in two places) add it to mapper and pull that in
//  mapper should have all the useful array functions too
//  string.inject in template belongs in mapper
//  also array to object (like ToDictionary in Linq)
(function(){
  'use strict';
  var path = require( 'path' ),
      fs = require( 'fs' ),
      minify = require( './minify' ),
      processQueue = require( './processQueue' ),
      
      name = process.argv.length > 2 ? process.argv[ 2 ] : 'mojule',
      inPath = process.argv.length > 3 ? process.argv[ 3 ] : '.',
      outPath = process.argv.length > 4 ? process.argv[ 4 ] : '.',
      nomin = process.argv.length > 5 ? process.argv[ 5 ].toLowerCase() === 'nomin' : false,
      
      builder = new ( require( './builder.js' ) ).Builder( name, inPath ),
      baseText = builder.base(),
      modules = builder.modules(),
      standalones = builder.standalones(),
      
      basePath = path.join( outPath, name + '.js' ),
      baseMinPath = path.join( outPath, name + '.min.js' ),

      pathQueue = [],
      minifyQueue = [],
      fileQueue = [];

  queueFile( basePath, baseText );
  if( !nomin ) {
    queueMinify( baseMinPath, baseText );
  }
  queueModules( name, outPath, modules, '' );
  queueModules( name, outPath, standalones, '.standalone' );    

  //Ick
  processQueue.process( pathQueue, function() {
    processQueue.process( minifyQueue, function() {
      processQueue.process( fileQueue );
    });
  });

  function queueFile( path, text ) {
    fileQueue.push(
      function( callback ) {
        fs.writeFile( path, text, function( err ){
          if( err ) {
            throw err;
          }
          console.log( 'Saved ' + path );
          callback();
        });
      }  
    );
  }

  function queueMinify( path, text ) {
    minifyQueue.push(
      function( callback ) {
        minify.closure( text, function( err, result ){
          if( err ) {
            throw err;
          }
          console.log( 'Minified ' + path );
          queueFile( path, result );
          callback();
        });      
      }
    );
  }

  function queuePath( modulePath ) {
    pathQueue.push(
      function( callback ) {
        fs.exists( modulePath, function( exists ){
          if( !exists ) {
            fs.mkdir( modulePath );
            console.log( 'Created directory ' + modulePath );
          }
          callback();
        });            
      }
    );
  }

  function queueModules( name, outPath, modules, suffix ) {
    for( var moduleName in modules ) {
      if( modules.hasOwnProperty( moduleName ) ) {
        var moduleCode = modules[ moduleName ],
            modulePath = path.join( outPath, name + '.' + moduleName ),
            moduleFileName = name + '.' + moduleName + suffix + '.js',
            moduleMinFileName = name + '.' + moduleName + suffix + '.min.js',
            moduleFile = path.join( modulePath, moduleFileName ),
            moduleMinFile = path.join( modulePath, moduleMinFileName );
            
        queuePath( modulePath );
        queueFile( moduleFile, moduleCode );
        if( !nomin ) {
          queueMinify( moduleMinFile, moduleCode );
        }
      }
    }
  }
}());