var miner = require('../../lib/miner');
var db = miner();

var Chain = require('../../lib/chain');
var RetextCart = require('../../lib/carts/retext');
var SentimentCart = require('../../lib/carts/sentiment');

var props = Chain()
  .use('retext', RetextCart(result => result.tweet.text))
  .use('sentiment', SentimentCart(result => result.tweet.text));

var stats = {
  countPositive: 0,
  countNeutral: 0,
  countNegative: 0,
  totalPolarity: 0,
};

db.createReadStream()
  .on('data', (result) => {
    props.exec(result.value, value => {
      var text = value.tweet.text;
      var s = value.sentiment;
      var tree = value.retext.tree;

      //if (value.tweet.retweeted_status) return;

      if (tree.data.valence === 'negative') {
        stats.countNegative += 1;
      }

      if (tree.data.valence === 'neutral') {
        stats.countNeutral += 1;
      }

      if (tree.data.valence === 'positive') {
        stats.countPositive += 1;
      }

      stats.totalPolarity += tree.data.polarity;
      console.log(tree.data.polarity, text);
      //console.log('sentiment', s);
      //console.log('tree', tree);
    })
  })
  .on('end', () => {
    stats.count = stats.countPositive + stats.countNeutral + stats.countNegative;
    console.log(stats);
  })
  // https://github.com/juliangruber/multilevel/issues/60#issuecomment-56110787
  .on('close', () => process.nextTick(() => db.close()));
