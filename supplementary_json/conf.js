/*
* This is a PJScrape config file.
* more on PJScrape here: http://nrabinowitz.github.io/pjscrape/
* I use this to scrape supplementary information from websites that PokeAPI doesn't have.
* Currently it's just move types but it can be used for more things, 
* like whether moves are physical or special.
*/

pjs.config({
    log: 'stdout',
    format: 'json',
    writer: 'file',
    outFile: 'move_types.json'
});

pjs.addSuite({
    url: 'http://veekun.com/dex/moves/search?sort=name&introduced_in=1&introduced_in=2&introduced_in=3&introduced_in=4&introduced_in=5&introduced_in=6',
    scraper: function() {
        return $('.dex-pokemon-moves tr').map(function(index, elem){
          var ro = {}
          var moveName = $(elem).find("td:first-child a").text().toLowerCase();
          var moveType = $(elem).find("td:nth-child(2) img").attr('title');
          ro[moveName] = moveType;
          return ro;
        }).toArray();
    }
});
