var path = require('path');
var net = require('net');
var level = require('level');
var multilevel = require('multilevel/msgpack');
var LevelLiveStream = require('level-live-stream');

module.exports = function (dbPath, inputs) {
  var db = level(dbPath, {
    createIfMissing: true,
    valueEncoding: 'json'
  });

  db.on('error', e => console.error(e));

  LevelLiveStream.install(db);

  net.createServer(con => {
    con
      .pipe(multilevel.server(db))
      .pipe(con);
  }).listen(process.env.DIGGER_PORT || 3000);

  Object.keys(inputs).forEach(name => {
    inputs[name](db.get.bind(db), db.put.bind(db));
  });
}
