var fs = require('fs');

module.exports.getMoveType = function(moveName) {
  var data = fs.readFileSync("./scraped_json/scrape_output.json");
  data = JSON.parse(data);
  data = data.filter(function(val, index, arr){
    return (moveName in val)
  });
  if(data.length > 0) {
    return data[0][moveName];
  } else {
    return "unavailable";
  }
}