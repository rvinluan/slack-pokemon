var express = require('express')
var bodyParser = require('body-parser')
var slack = require('./slack-api.js')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.get('/', function(request, response) {
  response.send('Hello There!')
})

app.post('/commands', function(request, response){
  slack.sendSlackPost({"text":"hi"});
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
