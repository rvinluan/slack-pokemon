var express = require('express')
var bodyParser = require('body-parser')

//Communicate with Slack
var slack = require('./slack-api.js')
//Communicate with the PokeAPI
var pokeapi = require('./poke-api.js')
//Generate messages for different situations
var battleText = require('./battle-text.js')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.get('/', function(request, response) {
  response.send('Hello There!')
})

app.post('/commands', function(request, response){
  var commands = request.body.text.split(" ");
  switch(commands[1]) {
    case 'use':
      pokeapi.getPokemon(commands[2], function(json){
        var ability1 = json.abilities[0].name;
        slack.sendSlackPost({"text":ability1})
      });
      break;
    default:
      var bt = battleText.unrecognizedCommand(commands);
      slack.sendSlackPost({"text":bt.text});
      break;
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
