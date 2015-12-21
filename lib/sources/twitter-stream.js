var debug = require('debug');
var dbg = debug('twitter-stream');

module.exports = function (T, opts, props, get, put) {
  var stream = T.stream('statuses/filter', opts);
  stream.on('tweet', function (tweet) {
    var key = 'twitter:' + tweet.id_str;
    props.exec({ tweet: tweet }, result => {
      put(key, result, (err) => {
        if (err) return console.error(err);
        dbg('put %s', key);
      });
    });
  });
}
