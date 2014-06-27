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
  response.writeHead(200, {"Content-Type": "application/json"});
  if(matchCommands(commands, "CHOOSE")) {
    battleText.userChoosePokemon(commands, function(obj){
      response.write(JSON.stringify({"text":obj.text + "\n" + obj.spriteUrl}));
    });
  }
  else if(matchCommands(commands, "ATTACK")) {
    battleText.useMove(commands[2], function(obj){
      response.write(JSON.stringify({"text": obj.text}))
    })
  }
  else if(matchCommands(commands, "START")) {
    battleText.startBattle(request.body, function(obj){
      if(obj.spriteUrl) {
        response.write(JSON.stringify({"text":obj.text + "\n" + obj.spriteUrl}))
      } else {
        response.write(JSON.stringify({"text":obj.text}))        
      }
    })
  }
  else if(matchCommands(commands, "END")) {
    battleText.endBattle(function(d){
      response.write(JSON.stringify({"text":"Battle over."}))
    })
  }
  else {
    battleText.unrecognizedCommand(commands, function(text){
      response.write(JSON.stringify({"text":text}));
    });
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

//utility functions

function matchCommands(commandArray, command) {
  var commandsDict = {
    "CHOOSE": "i choose",
    "ATTACK": "use",
    "START": "battle me",
    "END": "end battle"
  }
  //get rid of the 'pkmn'
  var cmdString = commandArray.join(" ").toLowerCase().replace("pkmn ", "");
  console.log(cmdString);
  return cmdString.indexOf(commandsDict[command]) === 0

}