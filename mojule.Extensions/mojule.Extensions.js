/*!
 * Extensions 0.0.235
 * Extend functionality without monkeypatching native objects
 * http://mojule.co.nz/
 *
 * Copyright 2011, Information Age Ltd
 * Licensed under the MIT License
 *
 * Date: 2012-07-16 11:18:53Z
 */

//  Declare but don't overwrite mojule if it already exists - this way parts of 
//  mojule can be added in any order or combination
var mojule = mojule === undefined ? {} : mojule;

(function(){
  'use strict';
  
  // Extend functionality without monkeypatching native objects
  var _ = mojule.Extensions = function( value ) {
    var extensions = {
      Number: {
        //  Restrict a number to a given range. if a number is less than min, make it 
        //  min, if it's more than, make it max, otherwise leave it alone      
        clamp: function( min, max ) {
          return value < min ? min : value > max ? max : value;
        },
        
        // Mostly useful for angles and time, if a number is outside of the range, wrap 
        // it so that it falls into the range        
        wrap: function( range ) {
          return ( value % range + range ) % range;
        },
        
        // Convert degrees to radians
        toRadians: function() {
          return _( value ).wrap( 360 ) / 180 * Math.PI;
        },
        
        // Difference between two numbers
        difference: function( num ) {
          return Math.abs( num - value );
        },
        
        // The value that you need to increment the first value by to make it closer to the second
        step: function( num ) {
          return value < num ? 1 : num < value ? -1 : 0;
        },
        
        // Rounds a number using fixed-point notation and return as a number
        toFixed: function( digits ) {
          return parseFloat( value.toFixed( digits ) );
        },
        
        // Checks if numbers are almost equal by fixing them at a number of digits before comparing
        // TODO: toFixed rounds - this will fail in some cases. Should truncate digits rather than round.
        almostEquals: function( num, digits ) {
          return _( value ).toFixed( digits ) === _( num ).toFixed( digits );
        },
        
        // Iterate * value with func
        each: function( func ) {
          for( var i = 0; i < value; i++ ) {
            func( i, value );
          }
        }
      },
      String: {      
        // Trims whitespace from start or end of string
        trim: function() {
          //call native functionality if it exists
          if( String.prototype.trim ){ return value.trim(); }
          
          return value.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
        },
  
        inject: function( obj ) {
          var text = value;
          _( obj ).each( function( value, key ){
            var keyToken = "{" + key + "}";
            while( text.match( keyToken ) ) {
              text = text.replace( keyToken, value );
            }
          });
          return text;      
        }      
      },
      
      Array: {
        //  Returns the first element in an array that matched the predicate, or the first
        //  element if no predicate is specified        
        first: function( predicate ) {
          if( !predicate ){ return value[ 0 ]; }
          
          for( var i = 0; i < value.length; i++ ) {
            if( predicate( value[ i ] ) ){ return value[ i ]; }
          } 
        },  
        
        //  Returns whether any elements in the array match the predicate        
        any: function( predicate ) {
          //call native functionality if it exists
          if( Array.prototype.some ){ return value.some( predicate ); }
          
          if( !predicate ){ return false; }
          
          _( value ).each( function( e ) {
            if( predicate( e ) ){ return true; }
          });
          
          return false;
        },
        
        //  Returns whether all elements in the array match the predicate.
        //  An empty array always return true.
        all: function( predicate ) {
          //call native functionality if it exists
          if( Array.prototype.every ){ return value.every( predicate ); }
          
          if( !predicate ){ return false; }
  
          _( value ).each( function( e ) {
            if( !predicate( e ) ){ return false; }
          });
  
          return true;
        },
        
        //  Returns whether all elements in the array are of a type
        allOfType: function( typename ) {
          return _( value ).all( function( element ){ return typeof element === typename; } );
        },
        
        //  Returns the first element in an array which is not undefined. Useful for 
        //  creating a list of fallback values. In the following example we try to set
        //  foo to the argument passed to the function, if that argument is undefined
        //  the next option is to leave foo with its existing value, however its 
        //  existing value may also be undefined in which case it falls back to 'bar'.
        //
        //  //  initializeFoo() may return undefined
        //  var foo = initializeFoo(); 
        //  function setFoo( value ) {
        //    foo = [ value, foo, 'bar' ].firstDefined();
        //  }        
        firstDefined: function() {
          return _( value ).first(function( element ) { 
            return element !== undefined;
          });
        },
        
        // Returns whether or not any of the elements in an array are not undefined. 
        // Useful for duck testing properties of an object to see if it meets certain criteria.
        //
        // function displayFooBar( value ) {
        //   var displayables = [ value.foo, value.bar ];
        //   if( displayables.anyDefined() ) {
        //     alert( displayables.firstDefined() );
        //   }  
        // }        
        anyDefined: function() {
          return _( value ).any(function( element ) { 
            return element !== undefined;
          });
        },
        
        // Returns whether all of the elements in an array are not undefined. 
        // Useful for duck testing properties of an object to see if it meets certain criteria.
        // An empty array always returns true.
        //
        // function displayFooBar( value ) {
        //   var displayables = [ value.foo, value.bar ];
        //   if( displayables.allDefined() ) {
        //     alert( value.foo() + value.bar() );
        //   }  
        // }        
        allDefined: function() {
          return _( value ).all(function( element ) { 
            return element !== undefined;
          });
        },
        
        // Returns whether arrays are equal based on elements
        // Normally [1,2]===[1,2] would return false
        elementsEqual: function( arr ) {
          if( value.length !== arr.length ) {
            return false;
          }
          for( var i = 0; i < arr.length; i++ ) {
            if( _( value[ i ] ).elementsEqual ) { //likely nested array
              if( !_( value[ i ] ).elementsEqual( arr[ i ] ) ) {
                return false;
              } else {
                continue;
              }
            }
            
            //test for implementation of equals first, otherwise use operator
            if( value[ i ].equal !== undefined && typeof value[ i ].equals === 'function' ) {
              if( !value[ i ].equals( arr[ i ] ) ) {
                return false
              }
            } else if( value[ i ] !== arr[ i ] ) {
              return false;
            }
          }
          return true;        
        },
        
        // Returns minimum value in an array
        min: function() {
          return Math.min.apply( Math, value );
        },
        
        // Returns minimum value in an array
        max: function() {
          return Math.max.apply( Math, value );
        },
        
        // Counts the number of elements that match the predicate or it's length if no predicate specified
        count: function( predicate ) {
          if( predicate === undefined ) {
            return value.length;
          }
          var count = 0;
          _( value ).each( function( e ) {
            if( predicate( e ) ) {
              count++;
            }
          });        
          return count;
        },
        
        // iterator
        each: function( func ) {
          for( var i = 0; i < value.length; i++ ) {
            func( value[ i ], i, value );
          }
        },
        
        //split an array up into chunks of size
        chunk: function( size ) {
          return [].concat.apply([],
            value.map( function( elem, i ) {
              return i % size ? [] : [ value.slice( i, i + size ) ];
            })
          );        
        }
      },
      Arguments: {
        // Returns the first argument if there is only one, otherwise returns arguments converted to an array.
        toValue: function() {
          var args = value.length === 0 ? undefined : value.length > 1 ? Array.prototype.slice.call( value ) : value[ 0 ];
          return args;
        },
        
        toObject: function( Constructor ) {
          return new Constructor( _( value ).toValue() );
        }
      }
    };
    
    //type is defined in extensions:
    var result = extensions[ _.getClass( value ) ];
    
    if( result !== undefined ) {
      return result;
    }
    
    //else (object extensions):
    return {
      equals: function( obj, properties ) {
          for( var i = 0; i < properties.length; i++ ) {
            if( value[ properties[ i ] ] !== obj[ properties[ i ] ] ) {
              return false;
            }
          }
          return true;
      },
      
      almostEquals: function( obj, properties ) {
        for( var i = 0; i < properties.length; i++ ) {
          if( !_( value[ properties[ i ] ] ).almostEquals( obj[ properties[ i ] ], 4 ) ) {
            return false;
          }
        }
        return true;    
      },
      
      getPropertyValues: function( properties ) {
        return properties.map( function( e ){
          return value[ e ];
        });
      },
      
      each: function( func ) {
        for( var key in value ) {
          if( value.hasOwnProperty( key ) ) {          
            func( value[ key ], key, value );
          }        
        }      
      },
      
      injectToString: function( template ) {
        return _( template ).inject( value );
      },
      
      hasAllProperties: function( properties ) {
        return _( properties ).all( function( property ) {
          return value[ property ] !== undefined;
        });
      }
    };
  };
  
  // Monkeypatch constructor.name for IE
  if( Function.prototype.name === undefined && Object.defineProperty !== undefined ) {
    Object.defineProperty( Function.prototype, 'name', {
      get: function() {
        var funcNameRegex = /function\s+(.{1,})\s*\(/;
        var results = ( funcNameRegex ).exec( ( this ).toString() );
        return ( results && results.length > 1 ) ? results[ 1 ] : '';
      },
      set: function( value ) {}
    });
  }  
  
  // Return both built in and user-defined types
  _.getClass = function( object ) {
    var name = Object.prototype.toString.call( object ).match( /^\[object\s(.*)\]$/ )[ 1 ];    
    return name === 'Object' && object.constructor.name !== 'Object' ? object.constructor.name : name;
  };
  
  // Extends classes so that standard math functions can be called on multiple properties
  _.addMath = function( object, properties ) {
    //only these functions operate on a single number
    var mathFunctions = [ 'abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'round', 'sin', 'sqrt', 'tan' ];
    _.mixin( Math, object, mathFunctions, properties );
  };
  
  // 
  _.mixin = function( source, destination, functions, properties ) {
    var addFunction = function( key ) {
      destination[ key ] = function() {
        for( var i = 0; i < properties.length; i++ ) {
          var property = properties[ i ];
          destination[ property ] = source[ key ].apply( source, [ destination[ property ] ] );
        }
        
        //because this is now a method on the object itself, return self in case we want to chain math functions with other chaining functions
        return destination;
      };
    };
    
    //copy the functions over
    for( var i = 0; i < functions.length; i++ ) {
      addFunction( functions[ i ] );
    }
  };
}());

//  Aliases
var Extensions = Extensions === undefined ? mojule.Extensions : Extensions;