var http = require('http')

module.exports = {}

module.exports.getPokemon = function(name, callback) {
  http.get("http://pokeapi.co/api/v1/pokemon"+name, function(res){
    res.setEncoding('utf-8');
    res.on("data", function(chunk) {
      console.log(res.statusCode);
      console.log(name);
      console.log(chunk);
      callback.call(this, chunk);
    })
  }).on('error', function(e) {
    console.log("got error: " + e.message)
  })
}