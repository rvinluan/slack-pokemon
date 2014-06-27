var fs = require('fs');

module.exports.getMoveType = function(moveName) {
  moveName = moveName.replace("-", " ");
  var data = fs.readFileSync("./scraped_json/scrape_output.json");
  data = JSON.parse(data);
  data = data.filter(function(val, index, arr){
    return Object.keys(val)[0] == moveName;
  });
  if(data.length > 0) {
    return data[0][moveName];
  } else {
    return "something weird";
  }
}