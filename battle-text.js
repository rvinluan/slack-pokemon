var pokeapi = require('./poke-api.js')

module.exports = {}

module.exports.unrecognizedCommand = function(commandsArray, callback) {
  var textString = "I don't recognize the command _{cmd}_ . Try <http://rv-slack-pokemon.herokuapp.com> for help.";
  commandsArray.shift(); //get rid of the 'pkmn'
  textString = textString.replace("{cmd}", commandsArray.join(" "));
  callback.call(this, textString);
}

module.exports.choosePokemon = function(commandsArray, callback) {
  var commandString = commandsArray.join(" "),
      pokemonName = commandsArray[3],
      textString = "You chose {pkmnn}. It has {hp} HP. ";
  //validate that the command was "pkmn i choose {pokemon}"
  if(!commandString.match(/i choose/i)) {
    module.exports.unrecognizedCommand(commandsArray, callback);
    return;
  }
  console.log('trying to fetch' + pokemonName);
  //grab the pokemon's data from the API
  pokeapi.getPokemon(pokemonName, function(data){
    console.log(data)
    //verify that it was a real pokemon
    if(data.error) {
      callback.call(this, "I don't think that's a real pokemon.");
      return;
    }
    textString = textString.replace("{pkmnn}", data.name);
    textString = textString.replace("{hp}", data.hp);
    callback.call(this, textString);
  });

}