var redis,
    rtg;

if(process.env.REDISTOGO_URL) {
  rtg   = require("url").parse(process.env.REDISTOGO_URL);
  redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
  //then we're running locally
  redis = require("redis").createClient();
}


module.exports = {};

module.exports.newBattle = function(playerName, callback) {
  redis.exists("currentBattle", function(err, data) {
    if(data === 0) {
      redis.set("currentBattle", playerName, function(e, d){
        callback({data: d});
      });
    } else {
      callback({error: "battle exists!"})
    }
  })
}

module.exports.getBattle = function(callback) {
  redis.get("currentBattle", function(err, data){
    if(err) {
      //TODO: handle.
    }
    callback(data);
  })
}

module.exports.endBattle = function(callback) {
  redis.del("currentBattle", function(err, data) {
    if(err) {
      //nope.
    }
    callback(data);
  });
}