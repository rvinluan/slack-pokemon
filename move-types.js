var fs = require('fs');

module.exports.getMoveType = function(moveName) {
  var data = fs.readFileSync("./scraped_json/scrape_output.json");
  data = JSON.parse(data);
  data = data.filter(function(val, index, arr){
    console.log("current data object: "+val.keys()[0]);
    console.log("move name: "+moveName);
    return true;
  });
  if(data.length > 0) {
    return data[0][moveName];
  } else {
    return "unavailable";
  }
}