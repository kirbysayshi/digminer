module.exports = function (get, keys) {
  var queries = keys.map(key => new Promise(resolve, reject) {
    get(key, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
