/*!
 * Color 1.0.234
 * A comprehensive JavaScript color class
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
  
  var _ = mojule.Extensions;
  // If data.value is not defined use the getter, otherwise use the setter
  function getOrSet( data ) {
    return data.value !== undefined ? data.setter() : data.getter();
  }    
  
  //  The relative brightness of an rgb value
  function rgbToBrightness( rgb ) {
    return rgb.red * 0.299 + rgb.green * 0.587 + rgb.blue * 0.114;
  }
  
  //  Difference in brightness between two rgb colors
  function rgbBrightnessDifference( rgb1, rgb2 ) {
    return Math.abs( rgbToBrightness( rgb1 ) - rgbToBrightness( rgb2 ) );
  }
  
  //  Difference in color between two rgb colors
  function rgbColorDifference( rgb1, rgb2 ) {
    var redMax = Math.max( rgb1.red, rgb2.red ),
        redMin = Math.min( rgb1.red, rgb2.red ),    
        greenMax = Math.max( rgb1.green, rgb2.green ),
        greenMin = Math.min( rgb1.green, rgb2.green ),    
        blueMax = Math.max( rgb1.blue, rgb2.blue ),
        blueMin = Math.min( rgb1.blue, rgb2.blue );
    
    return redMax - redMin + ( greenMax - greenMin ) + ( blueMax - blueMin );
  }
  
  //  Convert from the rgb to hsl color space
  function rgbToHsl( rgb ){
    var r = rgb.red / 255,
        g = rgb.green / 255,
        b = rgb.blue / 255,   
        max = Math.max( r, g, b ),
        min = Math.min( r, g, b ),
        h, 
        s, 
        l = (max + min) / 2,
        d = max - min;
  
    if( max === min ){
      h = s = 0; // achromatic
    } else {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  
    return { hue: h * 360, saturation: s * 100, lightness: l * 100 };
  }
  
  //  Convert from the hsl to rgb color space
  function hslToRgb( hsl ){
    var h = hsl.hue / 360,
        s = hsl.saturation / 100,
        l = hsl.lightness / 100,
        r, 
        g, 
        b,
        hue2rgb = function( p, q, t ){
          if( t < 0 ){ t += 1; }
          if( t > 1 ){ t -= 1; }
          if( t < 1 / 6 ){ return p + ( q - p ) * 6 * t; }
          if( t < 1 / 2 ){ return q; }
          if( t < 2 / 3 ){ return p + ( q - p ) * ( 2 / 3 - t ) * 6; }
          return p;
        },
        q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s,
        p = 2 * l - q;
  
    if( s === 0 ){
      r = g = b = l; // achromatic
    } else {
      r = hue2rgb( p, q, h + 1 / 3 );
      g = hue2rgb( p, q, h );
      b = hue2rgb( p, q, h - 1 / 3 );
    }
  
    return {
      red: r * 255,
      green: g * 255,
      blue: b * 255
    };
  }
  
  //  Convert from a 3 or 6 digit hex color (with or without leading #) to an
  //  rgb color
  function hexToRgb( hex ) {
    if( hex.substr( 0, 1 ) === '#' ){ hex = hex.substr( 1 ); }
    
    if( hex.length === 3 ) {
      return {
        red: parseInt( hex.substr( 0 , 1 ) + hex.substr( 0 , 1 ), 16 ),
        green: parseInt( hex.substr( 1 , 1 ) + hex.substr( 1 , 1 ), 16 ),
        blue: parseInt( hex.substr( 2 , 1 ) + hex.substr( 2 , 1 ), 16 )
      };              
    }
    
    return {
      red: parseInt( hex.substr( 0 , 2 ), 16 ),
      green: parseInt( hex.substr( 2 , 2 ), 16 ),
      blue: parseInt( hex.substr( 4 , 2 ), 16 )
    };                          
  }
  
  //  Convert a decimal number to it's hexadecimal form
  function decToHex( d ) {
    var hex = d.toString( 16 );
    
    return hex.length < 2 ? '0' + hex : hex;
  }
  
  //  Convert an rgb color to a 6 digit hex color, or a 3 digit hex color where
  //  possible, with a leading #
  function rgbToHex( rgb ) {
    var r = decToHex( Math.round( rgb.red ) ),
        g = decToHex( Math.round( rgb.green ) ),
        b = decToHex( Math.round( rgb.blue ) );
    
    return "#" + ( r.charAt( 0 ) === r.charAt( 1 ) && g.charAt( 0 ) === g.charAt( 1 ) && b.charAt( 0 ) === b.charAt( 1 ) ? r.charAt( 0 ) + g.charAt( 0 ) + b.charAt( 0 ) : r + g + b );
  }
  
  //  Modify an hsl color by multiplying the values together with the values 
  //  specified in modifiers, ie hslMultiply( foo, { lightness: 0.5 } ) will
  //  make a color half as bright as foo
  function hslMultiply( hsl, modifiers ) {
    return {
      hue: _( hsl.hue * _( [ modifiers.hue, modifiers.h, 1 ] ).firstDefined() ).wrap( 360 ),
      saturation: _( hsl.saturation * _( [ modifiers.saturation, modifiers.s, 1 ] ).firstDefined() ).clamp( 0, 100 ),
      lightness: _(  hsl.lightness * _( [ modifiers.lightness, modifiers.l, 1 ] ).firstDefined() ).clamp( 0, 100 ),
      alpha: _( hsl.alpha * _( [ modifiers.alpha, modifiers.a, 1 ] ).firstDefined() ).clamp( 0, 1 )
    };
  }
  
  // Modify an hsl color by summing the values together with the values 
  // specified in modifiers, ie hslSum( foo, { saturation: -25 } ) will make a 
  // color less saturated than foo
  function hslSum( hsl, modifiers ) {
    return {
      hue: _( hsl.hue + _( [ modifiers.hue, modifiers.h, 0 ] ).firstDefined() ).wrap( 360 ),
      saturation: _( hsl.saturation + _( [ modifiers.saturation, modifiers.s, 0 ] ).firstDefined() ).clamp( 0, 100 ),
      lightness: _( hsl.lightness + _( [ modifiers.lightness, modifiers.l, 0 ] ).firstDefined() ).clamp( 0, 100 ),
      alpha: _( hsl.alpha + _( [ modifiers.alpha, modifiers.a, 0 ] ).firstDefined() ).clamp( 0, 1 )
    };
  }  
  
  // Determines whether the color would be more readable against black or white
  // and returns black or white accordingly. Useful for making sure that text of
  // an arbitrary color remains readable, ie black or white text against a
  // colored background or colored text on a black or white background
  function toneFromRgb( rgb ) {
    var white = { red: 255, green: 255, blue: 255 },
        black = { red: 0, green: 0, blue: 0 },
        whiteDifference = rgbBrightnessDifference( rgb, white ),
        blackDifference = rgbBrightnessDifference( rgb, black ) - 30;
    
    return blackDifference > whiteDifference ? black : white;
  }
  
  // Constructor will try to figure out what value is, see mojule.Color.parse
  mojule.Color = function(){
    var r = 0, 
        g = 0, 
        b = 0, 
        h = 360, 
        s = 0, 
        l = 0, 
        a = 1,
        color = this;
   
    // An object with rgba and css information
    function getRgba() {
      return {
        red: Math.round( r ),
        green: Math.round( g ),
        blue: Math.round( b ),
        alpha: a,
        css: 'rgba( ' + Math.round( r ) + ', ' + Math.round( g ) + ', ' + Math.round( b ) + ', ' + a + ' )'
      };    
    }  
    
    // An object with hsla and css information
    function getHsla(){
      return {
        hue: h,
        saturation: s,
        lightness: l,
        alpha: a,
        css: 'hsla( ' + h + ', ' + s + '%, ' + l + '%, ' + a + ' )'
      };
    }
    
    // If called without an argument returns the current value for red, otherwise
    // sets the current value for red to the value passed and returns this 
    // instance of color to allow for method chaining. Following functions follow
    // the same pattern.
    this.red = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ return color.rgba({ red: this.value }); },
        getter: function(){ return r; }
      });
    };
    
    this.green = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ return color.rgba({ green: this.value }); },
        getter: function(){ return g; }
      });    
    };
    
    this.blue = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ return color.rgba({ blue: this.value }); },
        getter: function(){ return b; }
      });    
    };
    
    this.hue = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ return color.hsla({ hue: this.value }); },
        getter: function(){ return h; }
      });     
    }; 
    
    this.saturation = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ return color.hsla({ saturation: this.value }); },
        getter: function(){ return s; }
      }); 
    };   
    
    this.lightness = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ return color.hsla({ lightness: this.value }); },
        getter: function(){ return l; }
      });     
    };  
    
    this.alpha = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){ return color.hsla({ alpha: this.value }); },
        getter: function(){ return a; }
      });     
    };
    
    //  If called with no arguments gets an object with properties for red, green, 
    //  blue, alpha and the css string for the color. If called with a value sets 
    //  the color from an object with the properties [ red, green, blue, alpha ] 
    //  or [ r, g, b, a ]. You can pass partial objects through and only the 
    //  values passed will be set. When setting a value this function returns an 
    //  instance of this color to allow for method chaining.
    this.rgb = this.rgba = function( value ) {
      return getOrSet({
        value: value,
        setter: function() {
                  r = _( _( [ this.value.red, this.value.r, r, 0 ] ).firstDefined() ).clamp( 0, 255 );
                  g = _( _( [ this.value.green, this.value.g, g, 0 ] ).firstDefined() ).clamp( 0, 255 );
                  b = _( _( [ this.value.blue, this.value.b, b, 0 ] ).firstDefined() ).clamp( 0, 255 );
                  a = _( _( [ this.value.alpha, this.value.a, a, 1 ] ).firstDefined() ).clamp( 0, 1 );
                  
                  var hsl = rgbToHsl( getRgba() );
                  h = hsl.hue;
                  s = hsl.saturation;
                  l = hsl.lightness;
                  
                  return color;      
                },
        getter: getRgba
      });
    };
   
    //  Works in the same way as rgba except using the hsla color space
    this.hsl = this.hsla = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){
          h = _( _( [ this.value.hue, this.value.h, h, 360 ] ).firstDefined() ).wrap( 360 );
          s = _( _( [ this.value.saturation, this.value.s, s, 0 ] ).firstDefined() ).clamp( 0, 100 );
          l = _( _( [ this.value.lightness, this.value.l, l, 0 ] ).firstDefined() ).clamp( 0, 100 );
          a = _( _( [ this.value.alpha, this.value.a, a, 1 ] ).firstDefined() ).clamp( 0, 1 );
          
          var rgb = hslToRgb( getHsla() );
          r = rgb.red;
          g = rgb.green;
          b = rgb.blue;
          
          return color;      
        },
        getter: getHsla
      });
    };
    
    //  Set or get from an array of bytes - in this instance alpha is 0..255 rather than 0..1
    //  This is for compatibility with HTML canvas
    this.bytes = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){
          if( value instanceof Array ) {
            r = _( _( [ this.value[ 0 ], r ] ).firstDefined() ).clamp( 0, 255 );
            g = _( _( [ this.value[ 1 ], g ] ).firstDefined() ).clamp( 0, 255 );
            b = _( _( [ this.value[ 2 ], b ] ).firstDefined() ).clamp( 0, 255 );
            if( this.value[ 3 ] !== undefined ) {
              //only take 2 decimals of precision when converting from byte to float
              a = parseFloat( ( this.value[ 3 ] / 255 ).toFixed( 2 ) );
            }
            
            var hsl = rgbToHsl( getRgba() );
            h = hsl.hue;
            s = hsl.saturation;
            l = hsl.lightness;
          }
          return color;
        },
        getter: function(){
          return[ r, g, b, Math.round( a * 255 ) ];
        }
      });
    };
    
    //  Returns a simple hex string ie #39f or #abcdef if the color has no opacity,
    //  or as a CSS rgba declaration if it does
    this.toString = this.css = function() {
      return parseFloat( a ) === 1 ?
        color.hex():
        getRgba().css;
    };
    
    //  Gets a hex value or sets color from a hex value, see comment for this.red
    this.hex = function( value ) {
      return getOrSet({
        value: value,
        setter: function(){
                  return color.rgba( hexToRgb( this.value ) );
                },
        getter: function(){
                  return rgbToHex( getRgba() );
                }
      });
    };
    
    //  Gets relative brightness of the current color
    this.brightness = function(){
      return rgbToBrightness( getRgba() );
    };  
    
    //  Gets difference in brightness between the current color and another color.
    //  The compareValue color can be any value type that can be passed to the 
    //  constructor, see comment for constructor.
    this.brightnessDifference = function( compareValue ) {
      return rgbBrightnessDifference( color.rgba(), new mojule.Color( compareValue ).rgba() );
    };
    
    //  Gets difference in color between the current color and another color.
    //  The compareValue color can be any value type that can be passed to the 
    //  constructor, see comment for constructor.
    this.colorDifference = function( compareValue ) {
      return rgbColorDifference( color.rgba(), new mojule.Color( compareValue ).rgba() );
    };
    
    //  Determines if the current color has enough contrast with another color to
    //  be easily read against it. If colorThreshold and brightnessThreshold are
    //  omitted the values will default to W3 recommendations
    this.hasEnoughContrast = function( compareValue, colorThreshold, brightnessThreshold ) {
      colorThreshold = colorThreshold !== undefined ? colorThreshold : 500;
      brightnessThreshold = brightnessThreshold !== undefined ? brightnessThreshold : 125;
      return color.colorDifference( compareValue ) >= colorThreshold && color.brightnessDifference( compareValue ) >= brightnessThreshold;
    };
    
    //  See comment for hslMultiply
    this.multiplyHsla = function( modifier ) {
      return color.hsla( hslMultiply( color.hsla(), modifier ) );
    }; 
    
    //  See comment for hslSum
    this.sumHsla = function( modifier ) {
      return color.hsla( hslSum( color.hsla(), modifier ) );
    };
    
    //  Returns a new instance of this color that can be modified without 
    //  affecting the original color
    this.clone = function() {
      return new mojule.Color( color.hsla() );
    };
    
    //  See comment for toneFromRgb
    this.getContrastingTone = function() {
      return new mojule.Color( toneFromRgb( color.rgba() ) );
    };  
    
    //  Returns if the two colors are a match
    this.equals = function() {
      var color = new mojule.Color( _( arguments ).toValue() );
      return _( [ this.red(), this.green(), this.blue(), this.alpha() ] ).elementsEqual( [ color.red(), color.green(), color.blue(), color.alpha() ] );
    };
    
    //  Set this color from the passed in value
    mojule.Color.mapper.map( color, arguments );
  };
  
  mojule.Color.regexes = {
    cssHex: /^#(?:[0-9a-f]{3,6})\b$/i,
    cssRgb: /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i,
    cssRgbPercent: /^rgb\s*\(\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*\)$/i,
    cssRgba: /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9]+|[0-9]*\.[0-9])\s*\)$/i,
    cssRgbaPercent: /^rgba\s*\(\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])\s*\)$/i,
    cssHsl: /^hsl\s*\(\s*(\d+)\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*\)$/i,
    cssHsla: /^hsla\s*\(\s*(\d+)\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])%\s*,\s*([0-9]+|[0-9]*\.[0-9])\s*\)$/i
  };
  
  mojule.Color.mapper = new mojule.Mapper({
    cssHex: { 
      predicate:  function ( value ) {       
                    return typeof value === 'string' && mojule.Color.regexes.cssHex.test( _( value ).trim() );
                  }, 
      map:        function( value, color ) {
                    return color.hex( value );
                  }
    },
    cssRgb: { 
      predicate:  function( value ) {
                    return typeof value === 'string' && mojule.Color.regexes.cssRgb.test( _( value ).trim() );
                  }, 
      map:        function( value, color ) {
                    var matches = _( value ).trim().match( mojule.Color.regexes.cssRgb );
                    return color.rgba({ 
                      red: parseInt( matches[ 1 ], 10 ), 
                      green: parseInt( matches[ 2 ], 10 ), 
                      blue: parseInt( matches[ 3 ], 10 )
                    });
                  } 
    },
    cssRgbPercent: { 
      predicate:  function( value ) {
                    return typeof value === 'string' && mojule.Color.regexes.cssRgbPercent.test( _( value ).trim() );
                  }, 
      map:        function( value, color ) {
                    var matches = _( value ).trim().match( mojule.Color.regexes.cssRgbPercent );
                    return color.rgba({  
                      red: parseInt( matches[ 1 ], 10 ) * 2.55,  
                      green: parseInt( matches[ 2 ], 10 ) * 2.55, 
                      blue: parseInt( matches[ 3 ], 10 ) * 2.55,
                      alpha: 1
                    });
                  } 
    },
    cssRgba: { 
      predicate:  function( value ) {
                    return typeof value === 'string' && mojule.Color.regexes.cssRgba.test( _( value ).trim() );
                  }, 
      map:        function( value, color ) {
                    var matches = _( value ).trim().match( mojule.Color.regexes.cssRgba );
                    return color.rgba({  
                      red: parseInt( matches[ 1 ], 10 ), 
                      green: parseInt( matches[ 2 ], 10 ), 
                      blue: parseInt( matches[ 3 ], 10 ),
                      alpha: parseFloat( matches[ 4 ] )
                    });    
                  } 
    },
    cssRgbaPercent: { 
      predicate:  function( value ) {
                    return typeof value === 'string' && ( mojule.Color.regexes.cssRgbaPercent ).test( _( value ).trim() );
                  }, 
      map:        function( value, color ) {
                    var matches = _( value ).trim().match( mojule.Color.regexes.cssRgbaPercent );
                    return color.rgba({ 
                      red: parseInt( matches[ 1 ], 10 ) * 2.55,  
                      green: parseInt( matches[ 2 ], 10 ) * 2.55, 
                      blue: parseInt( matches[ 3 ], 10 ) * 2.55,
                      alpha: parseFloat( matches[ 4 ] )
                    });    
                  } 
    },
    cssHsl: { 
      predicate:  function( value ) {
                    return typeof value === 'string' && mojule.Color.regexes.cssHsl.test( _( value ).trim() );
                  }, 
      map:        function( value, color ) {
                    var matches = _( value ).trim().match( mojule.Color.regexes.cssHsl );
                    return color.hsla({  
                      hue: parseInt( matches[ 1 ], 10 ),
                      saturation: parseInt( matches[ 2 ], 10 ),
                      lightness: parseInt( matches[ 3 ], 10 ),
                      alpha: 1
                    });  
                  } 
    },
    cssHsla:  { 
      predicate:  function( value ) {
                    return typeof value === 'string' && mojule.Color.regexes.cssHsla.test( _( value ).trim() );
                  }, 
      map:        function( value, color ) {
                    var matches = _( value ).trim().match( mojule.Color.regexes.cssHsla );
                    return color.hsla({  
                      hue: parseInt( matches[ 1 ], 10 ),
                      saturation: parseInt( matches[ 2 ], 10 ),
                      lightness: parseInt( matches[ 3 ], 10 ),
                      alpha: parseFloat( matches[ 4 ] )
                    });      
                  } 
    },
    cssNamedColor: { 
      predicate:  function( value ) {
                    return typeof value === 'string' && mojule.Color.namedColors[ _( value ).trim() ] !== undefined;
                  }, 
      map:        function( value, color ) {
                    return color.rgba( mojule.Color.namedColors[ _( value ).trim() ].rgba() );
                  } 
    },
    color: {
      predicate:  function( value ) {
                    return typeof value.rgba === 'function';
                  },
      map:        function( value, color ) {
                    return color.rgba( value.rgba() );
                  }          
    },
    rgba: {
      predicate:  function( value ) {
                    return _( [ value.red, value.green, value.blue, value.r, value.g, value.b ] ).anyDefined();
                  }, 
      map:        function( value, color ) {
                    return color.rgba( value );
                  }                 
    },
    hsla: {
      predicate:  function( value ) {
                    return _( [ value.hue, value.saturation, value.lightness, value.h, value.s, value.l ] ).anyDefined();
                  }, 
      map:        function( value, color ) {
                    return color.hsla( value );
                  }                 
    },
    greyscale: {
      predicate:  function( value ) {
                    return typeof value === 'number';
                  },
      map:        function( value, color ) {
                    return color.rgb({
                      red: value,
                      green: value,
                      blue: value
                    });
                  }
    },
    greyscaleAlpha: {
      predicate:  function( value ) {
                    return value instanceof Array && value.length === 2 && _( value ).allOfType( 'number' );
                  },
      map:        function( value, color ) {
                    return color.rgba({
                      red: value[ 0 ],
                      green: value[ 0 ],
                      blue: value[ 0 ],
                      alpha: value[ 1 ]
                    });
                  }
    },
    rgbNumbers: {
      predicate:  function( value ) {
                    return value instanceof Array && value.length === 3 && _( value ).allOfType( 'number' );
                  },
      map:        function( value, color ) {
                    return color.rgb({
                      red: value[ 0 ],
                      green: value[ 1 ],
                      blue: value[ 2 ]
                    });
                  }      
    },
    rgbaNumbers: {
      predicate:  function( value ) {
                    return value instanceof Array && value.length === 4 && _( value ).allOfType( 'number' );
                  },
      map:        function( value, color ) {
                    return color.rgb({
                      red: value[ 0 ],
                      green: value[ 1 ],
                      blue: value[ 2 ],
                      alpha: value[ 3 ]
                    });
                  }      
    },
    imageData: {
      predicate:  function( value ) {
                    if( value instanceof Array && value.length === 3 && _( value.slice( 1 ) ).allOfType( 'number' ) ) {
                      return _( [ value[ 0 ].width, value[ 0 ].height, value[ 0 ].data ] ).allDefined();
                    }
                    return false;
                  },
      map:        function( value, color ) {
                    var imageData = value[ 0 ],
                        x = value[ 1 ],
                        y = value[ 2 ],
                        offset = ( y * imageData.width + x ) * 4,                                       
                        r = imageData.data[ offset ],
                        g = imageData.data[ offset + 1 ],
                        b = imageData.data[ offset + 2 ],
                        a = imageData.data[ offset + 3 ];
                    
                    return color.rgb({
                      red: r,
                      green: g,
                      blue: b,
                      alpha: a === 0 ? 0 : 255 / a
                    });
                  }        
    }
  });  
  
  //  Produces an array of colors with a length of steps where the first item 
  //  equals the start color, the last item equals the end color and the 
  //  intermediate items are interpolated values in between. You can pass a
  //  partial value for end and the undefined properties will be taken from start,
  //  so for example to create a range where just the hue gets interpolated you 
  //  could call it thusly:
  //  
  //  var start = {
  //    hue: 0,
  //    saturation: 100,
  //    lightness: 50
  //  }
  //  var end = {
  //    hue: 359
  //  }
  //  var hueRange = mojule.Color.range( start, end, 16 );
  mojule.Color.range = function( start, end, steps ) {  
    var startColor = new mojule.Color( start ),
        endColor = new mojule.Color( end ),
        startHsla = startColor.hsla(),      
        endHsla,
        colorRange = [],
        getStep = function( value, delta, step ) {
          return value + delta / ( steps - 1 ) * step;
        },
        mappingName = mojule.Color.mapper.getMappingName( end );
        
    //Allow for partial values to be passed through to end
    if( mappingName === 'rgba' ) {
      endColor = startColor.clone().rgba( end );    
    } else if( mappingName === 'hsla' ) {
      endColor = startColor.clone().hsla( end );
    }
    endHsla = endColor.hsla();
      
    steps = steps === undefined || steps < 2 ? 2 : steps;
  
    _( steps ).each( function( step ) {
      colorRange.push( new mojule.Color({
        hue: getStep( startHsla.hue, endHsla.hue - startHsla.hue, step ), 
        saturation: getStep( startHsla.saturation, endHsla.saturation - startHsla.saturation, step ), 
        lightness: getStep( startHsla.lightness, endHsla.lightness - startHsla.lightness, step ), 
        alpha: getStep( startHsla.alpha, endHsla.alpha - startHsla.alpha, step )
      }));    
    });
    
    return colorRange;
  };
  
  //  CSS3 named colors and their values
  mojule.Color.namedColors = {
    aliceblue: new mojule.Color( '#f0f8ff' ),
    antiquewhite: new mojule.Color( '#faebd7' ),
    aqua: new mojule.Color( '#00ffff' ),
    aquamarine: new mojule.Color( '#7fffd4' ),
    azure: new mojule.Color( '#f0ffff' ),
    beige: new mojule.Color( '#f5f5dc' ),
    bisque: new mojule.Color( '#ffe4c4' ),
    black: new mojule.Color( '#000000' ),
    blanchedalmond: new mojule.Color( '#ffebcd' ),
    blue: new mojule.Color( '#0000ff' ),
    blueviolet: new mojule.Color( '#8a2be2' ),
    brown: new mojule.Color( '#a52a2a' ),
    burlywood: new mojule.Color( '#deb887' ),
    cadetblue: new mojule.Color( '#5f9ea0' ),
    chartreuse: new mojule.Color( '#7fff00' ),
    chocolate: new mojule.Color( '#d2691e' ),
    coral: new mojule.Color( '#ff7f50' ),
    cornflowerblue: new mojule.Color( '#6495ed' ),
    cornsilk: new mojule.Color( '#fff8dc' ),
    crimson: new mojule.Color( '#dc143c' ),
    cyan: new mojule.Color( '#00ffff' ),
    darkblue: new mojule.Color( '#00008b' ),
    darkcyan: new mojule.Color( '#008b8b' ),
    darkgoldenrod: new mojule.Color( '#b8860b' ),
    darkgray: new mojule.Color( '#a9a9a9' ),
    darkgreen: new mojule.Color( '#006400' ),
    darkgrey: new mojule.Color( '#a9a9a9' ),
    darkkhaki: new mojule.Color( '#bdb76b' ),
    darkmagenta: new mojule.Color( '#8b008b' ),
    darkolivegreen: new mojule.Color( '#556b2f' ),
    darkorange: new mojule.Color( '#ff8c00' ),
    darkorchid: new mojule.Color( '#9932cc' ),
    darkred: new mojule.Color( '#8b0000' ),
    darksalmon: new mojule.Color( '#e9967a' ),
    darkseagreen: new mojule.Color( '#8fbc8f' ),
    darkslateblue: new mojule.Color( '#483d8b' ),
    darkslategray: new mojule.Color( '#2f4f4f' ),
    darkslategrey: new mojule.Color( '#2f4f4f' ),
    darkturquoise: new mojule.Color( '#00ced1' ),
    darkviolet: new mojule.Color( '#9400d3' ),
    deeppink: new mojule.Color( '#ff1493' ),
    deepskyblue: new mojule.Color( '#00bfff' ),
    dimgray: new mojule.Color( '#696969' ),
    dimgrey: new mojule.Color( '#696969' ),
    dodgerblue: new mojule.Color( '#1e90ff' ),
    firebrick: new mojule.Color( '#b22222' ),
    floralwhite: new mojule.Color( '#fffaf0' ),
    forestgreen: new mojule.Color( '#228b22' ),
    fuchsia: new mojule.Color( '#ff00ff' ),
    gainsboro: new mojule.Color( '#dcdcdc' ),
    ghostwhite: new mojule.Color( '#f8f8ff' ),
    gold: new mojule.Color( '#ffd700' ),
    goldenrod: new mojule.Color( '#daa520' ),
    gray: new mojule.Color( '#808080' ),
    green: new mojule.Color( '#008000' ),
    greenyellow: new mojule.Color( '#adff2f' ),
    grey: new mojule.Color( '#808080' ),
    honeydew: new mojule.Color( '#f0fff0' ),
    hotpink: new mojule.Color( '#ff69b4' ),
    indianred: new mojule.Color( '#cd5c5c' ),
    indigo: new mojule.Color( '#4b0082' ),
    ivory: new mojule.Color( '#fffff0' ),
    khaki: new mojule.Color( '#f0e68c' ),
    lavender: new mojule.Color( '#e6e6fa' ),
    lavenderblush: new mojule.Color( '#fff0f5' ),
    lawngreen: new mojule.Color( '#7cfc00' ),
    lemonchiffon: new mojule.Color( '#fffacd' ),
    lightblue: new mojule.Color( '#add8e6' ),
    lightcoral: new mojule.Color( '#f08080' ),
    lightcyan: new mojule.Color( '#e0ffff' ),
    lightgoldenrodyellow: new mojule.Color( '#fafad2' ),
    lightgray: new mojule.Color( '#d3d3d3' ),
    lightgreen: new mojule.Color( '#90ee90' ),
    lightgrey: new mojule.Color( '#d3d3d3' ),
    lightpink: new mojule.Color( '#ffb6c1' ),
    lightsalmon: new mojule.Color( '#ffa07a' ),
    lightseagreen: new mojule.Color( '#20b2aa' ),
    lightskyblue: new mojule.Color( '#87cefa' ),
    lightslategray: new mojule.Color( '#778899' ),
    lightslategrey: new mojule.Color( '#778899' ),
    lightsteelblue: new mojule.Color( '#b0c4de' ),
    lightyellow: new mojule.Color( '#ffffe0' ),
    lime: new mojule.Color( '#00ff00' ),
    limegreen: new mojule.Color( '#32cd32' ),
    linen: new mojule.Color( '#faf0e6' ),
    magenta: new mojule.Color( '#ff00ff' ),
    maroon: new mojule.Color( '#800000' ),
    mediumaquamarine: new mojule.Color( '#66cdaa' ),
    mediumblue: new mojule.Color( '#0000cd' ),
    mediumorchid: new mojule.Color( '#ba55d3' ),
    mediumpurple: new mojule.Color( '#9370db' ),
    mediumseagreen: new mojule.Color( '#3cb371' ),
    mediumslateblue: new mojule.Color( '#7b68ee' ),
    mediumspringgreen: new mojule.Color( '#00fa9a' ),
    mediumturquoise: new mojule.Color( '#48d1cc' ),
    mediumvioletred: new mojule.Color( '#c71585' ),
    midnightblue: new mojule.Color( '#191970' ),
    mintcream: new mojule.Color( '#f5fffa' ),
    mistyrose: new mojule.Color( '#ffe4e1' ),
    moccasin: new mojule.Color( '#ffe4b5' ),
    navajowhite: new mojule.Color( '#ffdead' ),
    navy: new mojule.Color( '#000080' ),
    oldlace: new mojule.Color( '#fdf5e6' ),
    olive: new mojule.Color( '#808000' ),
    olivedrab: new mojule.Color( '#6b8e23' ),
    orange: new mojule.Color( '#ffa500' ),
    orangered: new mojule.Color( '#ff4500' ),
    orchid: new mojule.Color( '#da70d6' ),
    palegoldenrod: new mojule.Color( '#eee8aa' ),
    palegreen: new mojule.Color( '#98fb98' ),
    paleturquoise: new mojule.Color( '#afeeee' ),
    palevioletred: new mojule.Color( '#db7093' ),
    papayawhip: new mojule.Color( '#ffefd5' ),
    peachpuff: new mojule.Color( '#ffdab9' ),
    peru: new mojule.Color( '#cd853f' ),
    pink: new mojule.Color( '#ffc0cb' ),
    plum: new mojule.Color( '#dda0dd' ),
    powderblue: new mojule.Color( '#b0e0e6' ),
    purple: new mojule.Color( '#800080' ),
    red: new mojule.Color( '#ff0000' ),
    rosybrown: new mojule.Color( '#bc8f8f' ),
    royalblue: new mojule.Color( '#4169e1' ),
    saddlebrown: new mojule.Color( '#8b4513' ),
    salmon: new mojule.Color( '#fa8072' ),
    sandybrown: new mojule.Color( '#f4a460' ),
    seagreen: new mojule.Color( '#2e8b57' ),
    seashell: new mojule.Color( '#fff5ee' ),
    sienna: new mojule.Color( '#a0522d' ),
    silver: new mojule.Color( '#c0c0c0' ),
    skyblue: new mojule.Color( '#87ceeb' ),
    slateblue: new mojule.Color( '#6a5acd' ),
    slategray: new mojule.Color( '#708090' ),
    slategrey: new mojule.Color( '#708090' ),
    snow: new mojule.Color( '#fffafa' ),
    springgreen: new mojule.Color( '#00ff7f' ),
    steelblue: new mojule.Color( '#4682b4' ),
    tan: new mojule.Color( '#d2b48c' ),
    teal: new mojule.Color( '#008080' ),
    thistle: new mojule.Color( '#d8bfd8' ),
    tomato: new mojule.Color( '#ff6347' ),
    turquoise: new mojule.Color( '#40e0d0' ),
    transparent: new mojule.Color({ alpha: 0 }),
    violet: new mojule.Color( '#ee82ee' ),
    wheat: new mojule.Color( '#f5deb3' ),
    white: new mojule.Color( '#ffffff' ),
    whitesmoke: new mojule.Color( '#f5f5f5' ),
    yellow: new mojule.Color( '#ffff00' ),
    yellowgreen: new mojule.Color( '#9acd32' ) 
  };
}());

//  Aliases
var Color = Color === undefined ? mojule.Color : Color;