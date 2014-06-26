var http = require('http')

module.exports = {}

module.exports.getPokemon = function(name, callback) {
  var options = {
    host: 'pokeapi.co',
    path: '/api/v1/pokemon/' + name,
    method: 'GET',
    headers: headers
  }
  var req = https.request(options, function(res){
    res.setEncoding('utf-8');
    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
    });
    res.on('end', function() {
      callback.call(this, JSON.parse(responseString))
    });
  })
  req.on('error', function(e){
    callback.call(this, [{
      "error": "wrong name"
    }])
  })
  req.write(dataString);
  req.end();

}