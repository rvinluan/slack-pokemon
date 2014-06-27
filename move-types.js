var fs = require('fs');

module.exports.getMoveType = function(moveName) {
  var data = fs.readFileSync("./scraped_json/scrape_output.json");
  data = JSON.parse(data);
  data.filter(function(val, index, arr){
    if (moveName in val) {
      return val[moveName];
    } else {
      return "unavailable";
    }
  })
}