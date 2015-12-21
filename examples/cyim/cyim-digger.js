var debug = require('debug');
var digger = require('../../lib/digger');
var path = require('path');
var Twit = require('twit');

var Chain = require('../../lib/chain');
var RetextCart = require('../../lib/carts/retext');
var SentimentCart = require('../../lib/carts/sentiment');

var TwitterStream = require('../../lib/sources/twitter-stream');
var TwitterBackfill = require('../../lib/sources/twitter-backfill');

var dbg = debug('sw-saber-digger');

var T = new Twit({
    consumer_key:         'xxxxxxxxxxxxxxxxxxxxxxxxx'
  , consumer_secret:      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  , access_token:         'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  , access_token_secret:  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
});

var props = Chain()
  .use('retext', RetextCart(result => result.tweet.text))
  .use('sentiment', SentimentCart(result => result.tweet.text))
  .use('filtered', (input, next) => {
    //if (/\s?exo\s?/gi.exec(input.tweet.text)) return next(new Error('skipping exo'));
    return next(null); // allow
  });

digger(path.join(__dirname, 'cyim.db'), {
  twitterStream: TwitterStream.bind(null, T, { track: 'artistyearinmusic,artist year in music' }, props),
  twitterBackfill: TwitterBackfill.bind(null, T, {
    q: 'artistyearinmusic OR "artist year in music" since:2015-12-01',
    count: 100,
    result_type: 'recent'
  }, props)
});
