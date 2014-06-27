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
    stateMachine.setUserHP(data.hp);
    textString = textString.replace("{pkmnn}", data.name);
    textString = textString.replace("{hp}", data.hp);
    callback({
      text: textString,
      spriteUrl: "http://pokeapi.co/media/img/"+data.pkdx_id+".png"
    })
  });

}

module.exports.npcChoosePokemon = function(dex_no, callback) {
  var textString = "I'll use {pkmnn}!",
      moves = [];
  module.exports.choosePokemon(dex_no, function(data){
    if(data.error) {
      callback(data.text)
      return;
    }
    moves = shuffle(data.moves);
    for(var i = 0; i < 4; i++) {
      //add the moves to allowed moves set.
      pokeapi.getMove("http://pokeapi.co"+moves[i].resource_uri, function(data) {
        stateMachine.addMoveNPC(data, function(){ /*do nothing*/ });
      })
    }
    stateMachine.setNpcHP(data.hp);
    textString = textString.replace("{pkmnn}", data.name);
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
      module.exports.npcChoosePokemon(dex_no, function(data) {
        callback({
          text: textString +"\n"+ data.text,
          spriteUrl: data.spriteUrl
        })
      }); 
    }
  })
}

module.exports.endBattle = function(callback) {
  stateMachine.endBattle(callback);
}

module.exports.useMove = function(moveName, callback) {
  var msgs_array = [],
      gameOver = false;;
  //first you go
  var textString = "You used {movename}. "
  stateMachine.getUserAllowedMoves(function(data){
    //console.log("is " +moveName+ " in " + data);
    if(data.indexOf(moveName) !== -1) {
      stateMachine.getSingleMove(moveName, function(d){
        //console.log("returned from getSingleMove:" + JSON.stringify(d))
        if(d) {
          //textString = textString.replace("{type}", d.type);
          //textString = textString.replace("{power}", d.power);
          textString = textString.replace("{movename}", moveName);
          stateMachine.doDamageToNpc(Math.ceil(d.power/5));
          stateMachine.getNpcHP(function(err, d1) {
            if(parseInt(d1, 10) <= 0) {
              stateMachine.endBattle(function(){
                callback({"text": "You beat me!"})
              })
              gameOver = true;
              return;
            }
            textString += "It did {dmg} damage, leaving me with {hp} HP!";
            textString = textString.replace("{dmg}", Math.ceil(d.power/5));
            textString = textString.replace("{hp}", d1);
            msgs_array.push(textString);
            //then the npc goes
          }) 
        } else {
          callback({"text": "weird"}) 
        }       
      })
    } else {
      callback({"text": "You can't use that move."})
    }
  });

  //then I go
  var npc_textString = "I use {movename}! "
  stateMachine.getNpcAllowedMoves(function(data){
    //choose a random move
    var npc_moveName = data[Math.floor(Math.random() * data.length)];
    stateMachine.getSingleMove(npc_moveName, function(d){
        //console.log("returned from getSingleMove:" + JSON.stringify(d))
        if(d) {
          //npc_textString = npc_textString.replace("{type}", d.type);
          //npc_textString = npc_textString.replace("{power}", d.power);
          npc_textString = npc_textString.replace("{movename}", npc_moveName);
          stateMachine.doDamageToUser(Math.ceil(d.power/5));
          stateMachine.getUserHP(function(err, d1) {
            if(parseInt(d1, 10) <= 0) {
              stateMachine.endBattle(function(){
                callback({"text": "I beat you!"});
              })
              gameOver = true;
              return;
            }
            npc_textString += "It did {dmg} damage, leaving you with {hp} HP!";
            npc_textString = npc_textString.replace("{dmg}", Math.ceil(d.power/5));
            npc_textString = npc_textString.replace("{hp}", d1);
            msgs_array.push(npc_textString);
            if(!gameOver)
              callback({"text": msgs_array.join("\n")})             
          })
        } else {
          callback({"text": "weird"}) 
        }       
      })
  });

}