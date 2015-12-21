var Retext = require('retext');
var RetextSentiment = require('retext-sentiment');

module.exports = function (reduce) {
  var retext = Retext().use(RetextSentiment);

  return (input, next) => {
    var reduced = reduce(input);
    retext.process(reduced, (err, file, doc) => {
      if (err) return next(err);
      next(null, file.data.retext);
    })
  }
}
