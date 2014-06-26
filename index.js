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

app.get('/startbattle', function(request, response) {
  stateMachine.newBattle("Rob", function(data) {
    if(data.error) {
      response.send(data.error);
    } else {
      response.send("battle started!");
    }
  })
});
app.get('/endbattle', function(request, response) {
  stateMachine.endBattle(function(data){
    response.send(data);
  });
});

app.post('/commands', function(request, response){
  var commands = request.body.text.toLowerCase().split(" "),
      bt;
  switch(commands[1]) {
    case 'i':
      battleText.choosePokemon(commands, function(obj){
        slack.sendSlackPost({"text":obj.text});
        slack.sendSlackPost({"text":obj.spriteUrl});
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
