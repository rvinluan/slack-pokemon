var pokeapi = require('./poke-api.js')

module.exports = {}

//Response to an unrecognized command
module.exports.unrecognizedText = function(commandsArray) {
  var textString = "I don't recognize that command _command_ . Try <http://rv-slack-pokemon.herokuapp.com> for help.";
  return { "text": textString }
}