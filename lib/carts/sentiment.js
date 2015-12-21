var sentiment = require('sentiment');

module.exports = function (reduce) {
  return (input, next) => {
    var reduced = reduce(input);
    next(null, sentiment(reduced));
  }
}
