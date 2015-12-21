var debug = require('debug');

module.exports = function () {
  var chain = [];

  var self = {
    exec: exec,
    use: use
  }

  return self;

  function exec (input, cb) {
    var remaining = chain.slice();
    _next();
    return self;

    function _next() {
      if (!remaining.length) return cb(input);
      var prop = remaining.shift();
      var handler = remaining.shift();
      if (prop in input) return _next();
      handler(input, (err, result) => {
        if (err) return;
        input[prop] = result;
        _next();
      });
    }
  }

  function use (prop, handler) {
    chain.push(prop, handler);
    return self;
  }
}
