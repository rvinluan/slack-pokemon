var pokeapi = require('./poke-api.js')

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

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
      textString = "You chose {pkmnn}. It has {hp} HP, and knows ",
      moves = [];
  //validate that the command was "pkmn i choose {pokemon}"
  if(!commandString.match(/i choose/i)) {
    module.exports.unrecognizedCommand(commandsArray, callback);
    return;
  }
  //grab the pokemon's data from the API
  pokeapi.getPokemon(pokemonName, function(data){
    //verify that it was a real pokemon
    if(data.error) {
      callback.call(this, "I don't think that's a real pokemon.");
      return;
    }
    //find 4 random moves
    moves = shuffle(data.moves);
    //vine whip, leer, solar beam, and tackle.
    for(var i = 0; i < 4; i++) {
      if(i < 3) {
        textString += moves[i].name;
        textString += ", ";
      } else {
        textString += "and ";
        textString += moves[i].name;
        textString += ".";
      }
    }
    textString = textString.replace("{pkmnn}", data.name);
    textString = textString.replace("{hp}", data.hp);
    //get the sprite
    callback({
      text: textString,
      spriteUrl: "http://pokeapi.co/media/img/"+data.pkdx_id+".png"
    })
  });

}