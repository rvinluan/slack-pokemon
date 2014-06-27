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

module.exports.newBattle = function(playerName, channel, callback) {
  redis.exists("currentBattle", function(err, data) {
    if(data === 0) {
      redis.hmset("currentBattle", {
        "playerName": playerName,
        "channel": channel
      }, function(e, d){
        callback({data: d});
      });
    } else {
      callback({error: "battle exists!"})
    }
  })
}

module.exports.getBattle = function(callback) {
  redis.hgetall("currentBattle", function(err, obj){
    if(err) {
      callback({error: "didn't work."})
    }
    callback(obj);
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

module.exports.addMove = function(moveName) {
  redis.sadd("user:allowedMoves", moveName);
}

module.exports.getMoves = function(callback) {
  redis.smembers("user:allowedMoves", function(err, data){
    callback(data);
  });
}