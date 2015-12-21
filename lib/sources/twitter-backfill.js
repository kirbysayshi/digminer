var bigint = require('bigintjs');
var debug = require('debug');
var dbg = debug('twitter-stream');

module.exports = function (T, opts, props, get, put) {
  var searchOpts = Object.assign({}, opts);
  search(searchOpts);

  function search (searchOpts) {
    dbg('GET search/tweets %o', searchOpts);
    T.get('search/tweets', searchOpts, (err, data, response) => {
      dbg('RES search/tweets %o err %o data %o', searchOpts, err, data);
      if (err) return console.error(err);
      if (!data.statuses.length) return;
      dbg('found %d tweets', data.statuses.length);

      var tasks = data.statuses.map(tweet => {
        var key = 'twitter:' + tweet.id_str;
        return (next) => {
          get(key, (err, result) => {

            // key exists
            if (!err) {
              dbg('key %s exists', key);
              return next(new Error('TweetKeyExists: ' + key));
            }

            dbg('propping key %s', key);
            props.exec({ tweet: tweet }, result => {
              put(key, result, (err) => {
                if (err) return next(err);
                dbg('put %s', key);
                return next();
              });
            })
          })
        }
      });

      queue(tasks, (err) => {
        // We didn't get through the whole queue
        if (err) {
          // don't keep querying
          dbg('got queue error, bailing. %o', err);
          return;
        }

        dbg('queue finished clear');

        // Only safe because the id_str is 64 bits
        var next_max_id = data.statuses.reduce((lowest, next) => {
          return lowest.length < next.id_str.length || lowest.localeCompare(next.id_str) < 0
            ? lowest
            : next.id_str;
        }, data.search_metadata.max_id_str);

        // The max_id_str property returned by the search result seems
        // to be unreliable.
        var nextOpts = Object.assign({}, searchOpts, {
          max_id: bigint(next_max_id).subtract(1).toString()
        });
        search(nextOpts);
      });
    });
  }
}

function queue (tasks, cb) {
  _next();

  function _next (err) {
    if (err) return cb(err);
    if (!tasks.length) return cb();
    var task = tasks.shift();
    task(_next);
  }
}
