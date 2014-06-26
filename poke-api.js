var request = require('request')

module.exports = {}

module.exports.getPokemon = function(name, callback) {
  request("http://pokeapi.co/api/v1/pokemon/"+name, function (error, response, body) {
    if (response.statusCode == 404) {
      callback.call(this, {"error": "failed to get pokemon"});
    }
    else if (response.statusCode == 200) {
      callback.call(this, JSON.parse(body));
    }
    else {
      callback.call(this, {"error": "weird error"})
    }
  })
}

module.exports.getSprite = function(url, callback) {
  console.log('getting sprite at ' + url)
  request(url, function (error, response, body) {
    if (response.statusCode == 404) {
      callback.call(this, {"error": "failed to get sprite"});
    }
    else if (response.statusCode == 200) {
      callback.call(this, JSON.parse(body));
    }
    else {
      callback.call(this, {"error": "weird error"})
    }
  })
}