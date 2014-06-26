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
  var commands = request.body.text.toLowerCase().split(" "),
      bt;
  switch(commands[1]) {
    case 'i':
      battleText.choosePokemon(commands, function(text){
        slack.sendSlackPost({"text":text});
      });
      break;
    default:
      battleText.unrecognizedCommand(commands, function(text){
        slack.sendSlackPost({"text":text});
      });
      break;
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
