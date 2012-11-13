/* template main */
/*!
 * {name} {version}
 * {description}
 * http://mojule.co.nz/
 *
 * Copyright 2011, Information Age Ltd
 * Licensed under the MIT License
 *
 * Date: {date}
 */

//  Declare but don't overwrite mojule if it already exists - this way parts of 
//  mojule can be added in any order or combination
var mojule = mojule === undefined ? {} : mojule;

(function(){
  'use strict';
  
{code}
}());

//  Aliases
{aliases}

/* template module */
(function(){
{code}
}());

/* template alias-body */
var {aliases}

/* template alias */
{name} = {name} === undefined ? mojule.{name} : {name}