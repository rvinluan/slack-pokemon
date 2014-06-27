var pokeapi = require('./poke-api.js')
var stateMachine = require('./state-machine.js')
var moves = require('./move-types.js')

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

module.exports.choosePokemon = function(pokemonName, callback) {
  pokeapi.getPokemon(pokemonName, function(data){
    if(data.error) {
      callback({
        error: "pokemon didn't exist",
        text: "I don't think that's a real pokemon."
      })
      return;
    }

    callback(data)
  });
}

module.exports.userChoosePokemon = function(commandsArray, callback) {
  var commandString = commandsArray.join(" "),
      pokemonName = commandsArray[3],
      textString = "You chose {pkmnn}. It has {hp} HP, and knows ",
      moves = [];
  //validate that the command was "pkmn i choose {pokemon}"
  if(!commandString.match(/i choose/i)) {
    module.exports.unrecognizedCommand(commandsArray, callback);
    return;
  }
  module.exports.choosePokemon(pokemonName, function(data){
    if(data.error) {
      callback(data.text)
      return;
    }
    moves = shuffle(data.moves);
    //vine whip, leer, solar beam, and tackle.
    for(var i = 0; i < 4; i++) {
      //add the moves to allowed moves set.
      pokeapi.getMove("http://pokeapi.co"+moves[i].resource_uri, function(data) {
        stateMachine.addMove(data, function(d){
          console.log("response from adding the move " + data.name + ": " + JSON.stringify(d));
        });
      })
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
    callback({
      text: textString,
      spriteUrl: "http://pokeapi.co/media/img/"+data.pkdx_id+".png"
    })
  });

}

module.exports.startBattle = function(slackData, callback) {
  textString = "OK {name}, I'll battle you! ".replace("{name}", slackData.user_name)
  stateMachine.newBattle(slackData.user_name, slackData.channel_name, function(data) {
    if(data.error) {
      //There's already a battle. Get data and then stop.
      stateMachine.getBattle(function(d){
        callback({
          text: "Sorry, I'm already in a battle in #" + d.channel
        })
      });
    } else {
      var dex_no = Math.ceil(Math.random() * 151);
      module.exports.choosePokemon(dex_no, function(data) {
        textString += "I'll choose " + data.name + "!";
        callback({
          text: textString,
          spriteUrl: "http://pokeapi.co/media/img/"+data.pkdx_id+".png"
        })
      }); 
    }
  })
}

module.exports.endBattle = function(callback) {
  stateMachine.endBattle(callback);
}

module.exports.useMove = function(moveName, callback) {
  var textString = "You used {movename}. The type is {type}."
  stateMachine.getUserAllowedMoves(function(data){
    //console.log("is " +moveName+ " in " + data);
    if(data.indexOf(moveName) !== -1) {
      stateMachine.getSingleMove(moveName, function(d){
        //console.log("returned from getSingleMove:" + JSON.stringify(d))
        if(d) {
          var type = d.type;
          textString = textString.replace("{type}", type);
          callback({"text": textString.replace("{movename}", moveName)}) 
        } else {
          callback({"text": "weird"}) 
        }       
      })
    } else {
      callback({"text": "You can't use that move."})
    }
  });
}