var https = require('https')

module.exports = {}

module.exports.sendSlackPost = function(hash) {
  var dataString = JSON.stringify({
    "text":hash.text
  });

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
      //TODO: do something with the response.
    });
  })
  req.on('error', function(e){
    console.log(e);
  })
  req.write(dataString);
  req.end();

}