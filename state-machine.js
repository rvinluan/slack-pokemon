var moves = require('./move-types.js');

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
  redis.del(
    ["currentBattle", "user:allowedMoves", "npc:allowedMoves", "npc:hp", "user:hp"], 
    function(err, data) {
    if(err) {
      //nope.
    }
    callback(data);
  });
}

module.exports.addMove = function(data, callback) {
  console.log("about to put in the move "+data.name.toLowerCase())
  redis.sadd("user:allowedMoves", data.name.toLowerCase());
  redis.hmset("move:"+data.name.toLowerCase(), 
    "power", data.power , 
    "type", moves.getMoveType(data.name.toLowerCase()), 
    function(err, d){
      console.log('this should mean hmset is done with '+data.name);
      callback(d)
    })
}

module.exports.addMoveNPC = function(data, callback) {
  console.log("about to put in the move "+data.name.toLowerCase())
  redis.sadd("npc:allowedMoves", data.name.toLowerCase());
  redis.hmset("move:"+data.name.toLowerCase(), 
    "power", data.power , 
    "type", moves.getMoveType(data.name.toLowerCase()), 
    function(err, d){
      console.log('this should mean hmset is done with '+data.name);
      callback(d)
    })
}

module.exports.getUserAllowedMoves = function(callback) {
  redis.smembers("user:allowedMoves", function(err, data){
    callback(data);
  });
}
module.exports.getNpcAllowedMoves = function(callback) {
  redis.smembers("npc:allowedMoves", function(err, data){
    callback(data);
  });
}

module.exports.getSingleMove = function(moveName, callback) {
  redis.hgetall("move:"+moveName.toLowerCase(), function(err, data){
    //console.log(moveName + " after getting out: " + JSON.stringify(data))
    callback(data);
  })
}

module.exports.setNpcHP = function(hp) {
  redis.set("npc:hp", hp);
}

module.exports.setUserHP = function(hp) {
  redis.set("user:hp", hp);
}