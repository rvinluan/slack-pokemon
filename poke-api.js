var http = require('http')

module.exports = {}

module.exports.getPokemon = function(name, callback) {
  http.get("http://pokeapi.co/api/v1/pokemon/"+name, function(res){
    console.log("Got response: " + res.statusCode);
    res.setEncoding('utf-8');
    body = '';
    res.on("data", function(chunk) {
      console.log("fetching")
      body += chunk;
    })
    res.on("end", function(){
      console.log("done done done");
    })
  }).on('error', function(e) {
    console.log("got error: " + e.message)
  })
}