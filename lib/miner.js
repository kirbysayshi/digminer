var path = require('path');
var net = require('net');
var multilevel = require('multilevel/msgpack');
var LevelLiveStream = require('level-live-stream');

module.exports = function (diggerPort) {
  var db = multilevel.client();
  var con = net.connect(diggerPort || process.env.DIGGER_PORT || 3000);

  con
    .pipe(db.createRpcStream())
    .pipe(con);

  return db;
}

