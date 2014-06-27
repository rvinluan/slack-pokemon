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
  if(matchCommands(commands, "CHOOSE")) {
    battleText.userChoosePokemon(commands, function(obj){
      slack.sendSlackPost({"text":obj.text + "\n" + obj.spriteUrl});
    });
  }
  else if(matchCommands(commands, "START")) {
    battleText.startBattle(request.body, function(obj){
      slack.sendSlackPost({"text":obj.text + obj.spriteUrl})
    })
  }
  else if(matchCommands(commands, "END")) {
    battleText.endBattle(function(d){
      slack.sendSlackPost({"text":"Battle over."})
    })
  }
  else {
    battleText.unrecognizedCommand(commands, function(text){
      slack.sendSlackPost({"text":text});
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