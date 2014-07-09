var express = require('express')
var bodyParser = require('body-parser')

//Communicate with Slack
var slack = require('./slack-api.js')
//Communicate with the PokeAPI
var pokeapi = require('./poke-api.js')
//Generate messages for different situations
var battleText = require('./battle-text.js')
//Talk to Redis to find out what state the batte is in
var stateMachine = require('./state-machine.js')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', function(request, response) {
  response.send('Hello There!')
})

app.post('/commands', function(request, response){
  var commands = request.body.text.toLowerCase().split(" "),
      bt;
  //response.writeHead(200, {"Content-Type": "application/json"});
  if(matchCommands(commands, "CHOOSE")) {
    battleText.userChoosePokemon(commands)
    .then(
      function(chosenObject){
        response.send(buildResponse(chosenObject.text + '\n' + chosenObject.spriteUrl));
      },
      function(err){
        console.log(err);
        response.send(buildResponse("I don't think that's a real Pokemon."));
      }
    )
  }
  else if(matchCommands(commands, "ATTACK")) {
    var moveName;
    if(commands[3]) {
      //remove 'pkmn use' so it's just the move name
      moveName = commands.slice(2).join('-');
    } else {
      moveName = commands[2];
    }
    battleText.useMove(moveName.toLowerCase())
    .then(
      function(textString){
        response.end(buildResponse(textString ));
      },
      function(err){
        console.log(err);
        response.send(buildResponse("You can't use that move."))
      }
    )
  }
  else if(matchCommands(commands, "START")) {
    battleText.startBattle(request.body)
    .then(
      function(startObj){
        response.send(buildResponse(startObj.text + "\n" + startObj.spriteUrl))
      },
      function(err) {
        console.log(err);
        response.send(buildResponse("Something went wrong."));
      }
    )
  }
  else if(matchCommands(commands, "END")) {
    battleText.endBattle()
    .then(
      function(){
        response.send(buildResponse("Battle Over."))
      },
      function(err){
        console.log(err);
        response.send(buildResponse("Couldn't end the battle."))
      }
    )
  }
  else {
    battleText.unrecognizedCommand(commands).then(function(text){
      response.send(buildResponse(text));
    });
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

//utility functions

function buildResponse(text) {
  var json = {
    "text": text,
    "username": "Pokemon Trainer",
    "icon_emoji": ":pkmntrainer:"
  }
  return JSON.stringify(json);
}

function matchCommands(commandArray, command) {
  var commandsDict = {
    "CHOOSE": "i choose",
    "ATTACK": "use",
    "START": "battle me",
    "END": "end battle"
  }
  //get rid of the 'pkmn'
  var cmdString = commandArray.join(" ").toLowerCase().replace("pkmn ", "");
  return cmdString.indexOf(commandsDict[command]) === 0

}