var fs = require('fs');

module.exports.getMoveType = function(moveName) {
  var data = fs.readFileSync("./scraped_json/scrape_output.json");
  data = JSON.parse(data);
  console.log("data start:" + data[2]);
}