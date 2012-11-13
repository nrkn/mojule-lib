//from https://github.com/weaver/scribbles/blob/master/node/google-closure/lib/closure.js
//modifed to use simple_optimizations instead of advanced - advanced mauls code if not used carefully
this.closure = function( code, next ) {
  try {
    var qs = require('querystring'),
        http = require('http'),
        host = 'closure-compiler.appspot.com',
        body = qs.stringify({
          js_code: code.toString('utf-8'),
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          output_format: 'json',
          output_info: 'compiled_code'
        }),
        client = http.createClient(80, host).on('error', next),
        req = client.request('POST', '/compile', {
          'Host': host,
          'Content-Length': body.length,
          'Content-Type': 'application/x-www-form-urlencoded'
        });

    req.on('error', next).end(body);

    req.on('response', function(res) {
      if (res.statusCode != 200)
        next(new Error('Unexpected HTTP response: ' + res.statusCode));
      else
        capture(res, 'utf-8', parseResponse);
    });

    function parseResponse(err, data) {
      err ? next(err) : loadJSON(data, function(err, obj) {
        var error;
        if (err)
          next(err);
        else if ((error = obj.errors || obj.serverErrors || obj.warnings))
          next(new Error('Failed to compile: ' + sys.inspect(error)));
        else
          next(null, obj.compiledCode);
      });
    }
  } catch (err) {
    next(err);
  }
}

// Convert a Stream to a String.
//
// + input - Stream object
// + encoding - String input encoding
// + next - Function error/success callback
//
// Returns nothing.
function capture(input, encoding, next) {
  var buffer = '';

  input.on('data', function(chunk) {
    buffer += chunk.toString(encoding);
  });

  input.on('end', function() {
    next(null, buffer);
  });

  input.on('error', next);
}

// Convert JSON.load() to callback-style.
//
// + data - String value to load
// + next - Function error/success callback
//
// Returns nothing.
function loadJSON(data, next) {
  var err, obj;

  try {
    obj = JSON.parse(data);
  } catch (x) {
    err = x;
  }
  next(err, obj);
}