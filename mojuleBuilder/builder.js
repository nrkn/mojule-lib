(function(){
  'use strict';
  var path = require( 'path' ),
      fs = require( 'fs' ),
      metadataRepository = require( './metadataRepository' ),
      Template = require( './template' ).Template;

  exports.Builder = function( name, inPath ) {
    var _name = name,
        _inPath = inPath,
        _settingsFile = path.join( inPath, name + '.build.json' ),
        _templateFile = path.join( inPath, name + '.template.js' ),
        _templateText = fs.readFileSync( _templateFile, 'utf-8' ),
        _repository = metadataRepository.load( _settingsFile ),
        _template = new Template( _templateText );

    _repository.bumpVersions();    
    _repository.save( _settingsFile );
      
    this.base = function(){
      var values = {
        name: _repository.name,
        version: _repository.version,
        description: _repository.description,
        date: formattedDate(),
        code: indent( getModulesCode( _repository.modules ), 2 ),
        aliases: getAliases()
      };

      return _template.expand( 'main', values );
    };
    
    this.modules = function(){
      var modulesMap = {};
      for( var i = 0; i < _repository.modules.length; i++ ) {
        var m = _repository.modules[ i ];
        modulesMap[ m.name ] = module( m );
      }    
      return modulesMap;
    };
    
    this.standalones = function(){
      var modulesMap = {};
      for( var i = 0; i < _repository.modules.length; i++ ) {
        var m = _repository.modules[ i ];
        if( m.requires.length > 0 ) {
          modulesMap[ m.name ] = standalone( m );
        }
      }    
      return modulesMap;
    };
      
    function module( m ) {
      var values = {
        name: m.name,
        version: m.version,
        description: m.description,
        date: formattedDate(),
        code: indent( getModuleCode( m, true ), 2 ),
        aliases: getAlias( m )    
      };
      
      return _template.expand( 'main', values );
    }
    
    function standalone( m ) {
      var ms = _repository.modules.filter( function( mod ) {
        return m.requires.indexOf( mod.name ) !== -1;
      });
      var values = {
        name: m.name,
        version: m.version,
        description: m.description,
        date: formattedDate(),
        code: indent( getModulesCode( ms ), 2 ) + '\r\n' + indent( getModuleCode( m, true ), 2 ),
        aliases: getAlias( m )
      };
      
      return _template.expand( 'main', values );
    }
    
    function getAlias( m ) {
      var aliases = m.exports.map( function( s ) {
        return _template.singleValue( 'alias', 'name', s );
      });
      return _template.singleValue( 'alias-body', 'aliases', aliases.join( ',\r\n    ' ) + ';' );
    }  
    
    function getAliases() {
      var aliases = _repository.modules.map( function( m ){
        return m.exports;
      }).reduce( function( a, b ) {
        return a.concat( b );
      }).map( function( m ){
        return _template.singleValue( 'alias', 'name', m );
      });
      
      return _template.singleValue( 'alias-body', 'aliases', aliases.join( ',\r\n    ' ) + ';' );
    }  
    
    function getModulesCode( modules ) {
      var ms = modules.map( function( m ) {
        return getModuleCode( m );
      });
      
      var code = ms.join( '\r\n' );
      
      return code.replace( /\s+$/, '' );
    }  
    
    function getModuleCode( module, doNotWrap ) {
      doNotWrap = doNotWrap === undefined ? false : doNotWrap;
      
      var basePath = path.join( _inPath, _name + '.' + module.name ),
          baseModulePath = path.join( basePath, _name + '.' + module.name + '.raw.js' ),
          code = fs.existsSync( baseModulePath ) ? fs.readFileSync( baseModulePath, 'utf-8' ) : '',
          additionalClasses = module.exports.filter( function( e ){
                                return e !== module.name;
                              });
                              
      if( additionalClasses.length > 0 ) {
        var paths = additionalClasses.map(function( t ) {
          return path.join( basePath, _name + '.' + t + '.raw.js' );
        });
        
        for( var i = 0; i < paths.length; i++ ) {
          code += '\r\n' + fs.readFileSync( paths[ i ], 'utf-8' );
        }
      }
      
      if( module.localAliases !== undefined ) {
        var localAliases = [];
        for( var key in module.localAliases ) {
          if( module.localAliases.hasOwnProperty( key ) ) {
            localAliases.push( module.localAliases[ key ] + ' = ' + _name + '.' + key );
          }
        }
        
        if( localAliases.length > 0 ) {
          var localAlias = localAliases.join( ',\r\n    ' ) + ';';
        
          code = _template.singleValue( 'alias-body', 'aliases', localAlias ) + '\r\n' + code;
        }
      }
      
      return module.wrap && !doNotWrap ? wrapModule( indent( code, 2 ) ) : code;
    }
    
    function wrapModule( code ) {
      return _template.singleValue( 'module', 'code', code ); 
    }
    
    function indent( lines, indentation ) {    
      return lines.split( '\n' ).map( function( s ) {
        return new Array( indentation + 1 ).join( ' ' ) + s;
      }).join( '\n' );
    }
    
    function formattedDate() {
      function padStr( s ) {
        return s < 10 ? '0' + s : ''  + s;
      }
      
      var now = new Date();
      return (
        now.getFullYear().toString() + '-' + 
        padStr( now.getMonth() + 1 ) + '-' + 
        padStr( now.getDate() ) + ' ' +
        padStr( now.getHours() ) + ':' +
        padStr( now.getMinutes() ) + ':' +
        padStr( now.getSeconds() ) + 'Z'        
      );
    }    
  };
}());