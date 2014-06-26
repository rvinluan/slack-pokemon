var express = require('express')
var bodyParser = require('body-parser')
var https = require('https')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.get('/', function(request, response) {
  response.send('Hello There!')
})

app.post('/commands', function(request, response){
  console.log(request.body);
  var dataString = JSON.stringify({"text":"hello there"});
  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': dataString.length
  }
  var options = {
    host: 'voxmedia.slack.com',
    path: '/services/hooks/incoming-webhook?token=sl0IcSNRYYr5c0mZYSOX0V9W',
    method: 'POST',
    headers: headers
  }

  var req = https.request(options, function(res){
    res.setEncoding('utf-8');
    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
    });
    res.on('end', function() {
      response.send('posted!\n')
    });
  })
  req.on('error', function(e){
    console.log(e);
  })
  req.write(dataString);
  req.end();
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
