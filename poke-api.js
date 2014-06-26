var http = require('http')

module.exports = {}

module.exports.getPokemon = function(name, callback) {
  http.get("http://pokeapi.co/api/v1/pokemon"+name, function(res){
    console.log(res)
    callback.call(this, res);
  }).on('error', function(e) {
    console.log("got error: " + e.message)
  })
}