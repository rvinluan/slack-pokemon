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

module.exports.newBattle = function(playerName) {
  if(redis.exists("currentBattle")) {
    return false;
  }
  redis.set("currentBattle", playerName, redis.print);
}

module.exports.endBattle = function() {
  redis.del("currentBattle");
}