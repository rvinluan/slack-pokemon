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
app.use(bodyParser.urlencoded())

app.get('/', function(request, response) {
  response.send('Hello There!')
})

app.post('/commands', function(request, response){
  var commands = request.body.text.toLowerCase().split(" "),
      bt;
  //response.writeHead(200, {"Content-Type": "application/json"});
  if(matchCommands(commands, "CHOOSE")) {
    battleText.userChoosePokemon(commands, function(obj){
      if(obj.spriteUrl) {
        response.end(buildResponse("I don't thinkt that's a real Pokemon."));
      } else {
        response.end(buildResponse(obj.text));
      }
    });
  }
  else if(matchCommands(commands, "ATTACK")) {
    var moveName;
    if(commands[3]) {
      moveName = commands[2] + "-" + commands[3];
    } else {
      moveName = commands[2]
    }
    battleText.useMove(moveName, function(obj){
      response.end(buildResponse(obj.text));
    })
  }
  else if(matchCommands(commands, "START")) {
    battleText.startBattle(request.body, function(obj){
      if(obj.spriteUrl) {
        response.end(buildResponse(obj.text + "\n" + obj.spriteUrl));
      } else {
        response.end(buildResponse(obj.text));
      }
    })
  }
  else if(matchCommands(commands, "END")) {
    battleText.endBattle(function(d){
      response.end(buildResponse("Battle Over."));
    })
  }
  else {
    battleText.unrecognizedCommand(commands, function(text){
      response.end(buildResponse(text));
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