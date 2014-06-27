var fs = require('fs');

module.exports.getMoveType = function(moveName) {
  var data = fs.readFileSync("./scraped_json/scrape_output.json");
  data = data.filter(function(elem, index, arr){
    if(moveName in elem) {
      return elem[moveName];
    } else {
      return "";
    }
  })
}