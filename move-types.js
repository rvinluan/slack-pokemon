var fs = require('fs');

module.exports.getMoveType = function(moveName) {
  var data = fs.readFileSync("./scraped_json/scrape_output.json");
  console.log("first move:" + data[2]);
}