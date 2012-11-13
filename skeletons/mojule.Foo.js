/*!
 * mojule.Foo v0.0
 * Summary
 * http://mojule.co.nz/
 *
 * Copyright 2011, Information Age Ltd
 * Licensed under the MIT License
 *
 * Date: Current Date
 */
/*
  TODO
    add todo items
*/

//  Declare but don't overwrite mojule if it already exists - this way parts of 
//  mojule can be added in any order or combination
var mojule = mojule === undefined ? {} : mojule;

(function(){
  'use strict';
  
  //functions that Foo might use but that don't need Foo
  // If data.value is not defined use the getter, otherwise use the setter
  function getOrSet( data ) {
    return data.value !== undefined ? data.setter() : data.getter();
  }   
  
  // Constructor
  mojule.Foo = function( args ){
    //private vars
    var bar,
        foo = this;
   
    //private functions
    function foobar( foo, bar ) {
    }
    
    //public functions
    this.barfoo = function( foo, bar ) {
    };
    
    //getter/setter depending on if value passed
    this.bar = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ 
          bar = value;
          return foo;
        },
        getter: function(){ 
          return bar; 
        }
      });      
    }
  };  
  
  //anything else?
}());

//  Alias mojule.Foo to just Foo providing there are no conflicts
var Foo = Foo === undefined ? mojule.Foo : Foo;