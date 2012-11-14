/*!
 * Mapper 0.0.234
 * Maps objects to different objects, for constructors etc.
 * http://mojule.co.nz/
 *
 * Copyright 2011, Information Age Ltd
 * Licensed under the MIT License
 *
 * Date: 2012-11-14 14:23:32Z
 */

//  Declare but don't overwrite mojule if it already exists - this way parts of 
//  mojule can be added in any order or combination
var mojule = mojule === undefined ? {} : mojule;

(function(){
  'use strict';
  
  var _ = mojule.Extensions;
  // Constructor
  mojule.Mapper = function( args ){
    //private vars
    var mapper = this,
        mappings = {
          undefinedValue: {
            predicate: function( value ){ 
              return value === undefined || value === null; 
            },
            map: function( value, obj ){
              return obj;
            }
          },
          toArray: function(){
            var asArray = [];
            for( var key in this ) {
              if( this.hasOwnProperty( key ) && typeof this[ key ] !== 'function' ) {          
                asArray.push({
                  name: key,
                  predicate: this[ key ].predicate,
                  map: this[ key ].map
                });
              }
            } 
            return asArray;
          }
        };
    
    
    //  Determines if value is something we can deal with and if so create the 
    //  object from value.
    this.map = function( obj, args ) {         
      //if there is only one arg, set value to that, otherwise convert args to an array
      var value = _( args ).toValue();
    
      var mapping = _( mappings.toArray() ).first( function( element ){
        return element.predicate( value );
      });
          
      if( !mapping ) { return undefined; }
      
      return mapping.map( value, obj );
    };
    
    //  Returns whether or not a particular value can be parsed
    this.hasMapping = function( value ) {
      return _( mappings.toArray() ).any( function( element ){ return element.predicate( value ); } );
    };
    
    //  If the value has a mapping that can handle it, return its name
    this.getMappingName = function( value ) {
      var mapping = _( mappings.toArray() ).first( function( element ){ return element.predicate( value ); } );
      if( mapping !== undefined ){ return mapping.name; }
    }; 
  
    // Allows you to add a custom mapping. name is an identifier and should
    // be unique. If it is not unique it will overwrite the existing mapping!
    //
    // mapping should be an object like:
    //
    //   {
    //     predicate: function( value ){
    //       // Return a boolean representing whether this parser
    //       // handles given value
    //     },
    //     parse: function( value, obj ) {
    //       // Set the value on obj then return obj so that methods
    //       // can be chained
    //     }
    //   }
    this.addMapping = function( name, mapping ) {
      mappings[ name ] = mapping;
    };
    
    this.addMappings = function( mappings ) {
      _( mappings ).each( function( mapping, key ) {
        if( typeof mapping !== 'function' ) {          
          mapper.addMapping( key, {
            predicate: mapping.predicate,
            map: mapping.map
          });
        }    
      });
    };
  
    // Remove a parser by name
    this.removeMapping = function( name ) {
      if( mappings[ name ] !== undefined ) {
        delete mappings[ name ];
      }
    };
    
    if( args !== undefined ) {
      if( args instanceof Array ) {
        _( args ).each( function( arg ) {
          mapper.addMappings( arg );
        });
      } else {
        mapper.addMappings( args );
      }
    }
  };
}());

//  Aliases
var Mapper = Mapper === undefined ? mojule.Mapper : Mapper;