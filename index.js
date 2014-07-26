var express = require('express'),
    bodyParser = require('body-parser'),
    //Communicate with the PokeAPI
    pokeapi = require('./poke-api.js'),
    //Generate messages for different situations
    battleText = require('./battle-text.js'),
    //Communicate with Redis
    stateMachine = require('./state-machine.js'),
    app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(request, response) {
  response.send('Hello There!')
});

/*
* This is the main function that recieves post commands from Slack.
* They come in this format:
* {
*   "text": "pkmn battle me",
*   "user": "rvinluan",
*   "channel": "#pkmn_battles" 
* }
* There's more stuff but that's all we care about.
* All error handling is bubbled up to this function and handled here.
* It doesn't distinguish between different types of errors, but it probably should.
*/
app.post('/commands', function(request, response){
  var commands = request.body.text.toLowerCase().split(" ");

  if(matchCommands(commands, "CHOOSE")) {
    battleText.userChoosePokemon(commands)
    .then(
      function(chosenObject){
        response.send(buildResponse(chosenObject.text + '\n' + chosenObject.spriteUrl));
      },
      function(err){
        console.log(err);
        response.send(buildResponse("I don't think that's a real Pokemon. "+err));
      }
    )
  }
  else if(matchCommands(commands, "ATTACK")) {
    var moveName;
    if(commands[3]) {
      //for moves that are 2+ words, like 'Flare Blitz' or 'Will O Wisp'
      moveName = commands.slice(2).join('-');
    } else {
      moveName = commands[2];
    }
    battleText.useMove(moveName.toLowerCase())
    .then(
      function(textString){
        response.end(buildResponse(textString));
      },
      function(err){
        console.log(err);
        response.send(buildResponse("You can't use that move. "+err))
      }
    )
  }
  else if(matchCommands(commands, "START")) {
    //send in the whole request.body because it needs the Slack username and channel
    battleText.startBattle(request.body)
    .then(
      function(startObj){
        response.send(buildResponse(startObj.text + "\n" + startObj.spriteUrl))
      },
      function(err) {
        console.log(err);
        response.send(buildResponse("Something went wrong. "+err));
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
        response.send(buildResponse("Couldn't end the battle. "+err))
      }
    )
  }
  else {
    battleText.unrecognizedCommand(commands)
    .then(function(text){
      response.send(buildResponse(text));
    });
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

//utility functions

/*
* Helper function to build the JSON to send back to Slack.
* Make sure to make a custom emoji in your Slack integration named :pkmntrainer:
* with the included pkmntrainer jpeg, otherwise the profile picture won't work.
*/
function buildResponse(text) {
  var json = {
    "text": text,
    "username": "Pokemon Trainer",
    "icon_emoji": ":pkmntrainer:"
  }
  return JSON.stringify(json);
}

/*
* Helper function to match commands, instead of a switch statement,
* because then you can do stuff like use Regex here or something fancier.
* Also keeps all the possible commands and their trigger words in one place.
*/
function matchCommands(commandArray, command) {
  var commandsDict = {
    "CHOOSE": "i choose",
    "ATTACK": "use",
    "START": "battle me",
    "END": "end battle"
  }
  var cmdString = commandArray.join(" ").toLowerCase().replace("pkmn ", "");
  return cmdString.indexOf(commandsDict[command]) === 0;
}