var fs = require('fs');

/*
* This is a SYNCHRONOUS function to get the type of a move from an external file,
* because PokeAPI doesn't have that data. 
* I had to scrape it from somewhere and put it into this JSON.
* TODO: make this use promises.
*/
module.exports.getMoveType = function(moveName) {
  moveName = moveName.replace("-", " ");
  var data = fs.readFileSync("./supplementary_json/move_types.json");
  data = JSON.parse(data);
  data = data.filter(function(val, index, arr){
    return Object.keys(val)[0] == moveName;
  });
  if(data.length > 0) {
    return data[0][moveName];
  } else {
    //currently this fails silently;
    //once this uses Promises it'll be able to throw an error
    return " ";
  }
}