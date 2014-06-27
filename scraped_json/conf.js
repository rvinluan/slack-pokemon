pjs.config({ 
    // options: 'stdout', 'file' (set in config.logFile) or 'none'
    log: 'stdout',
    // options: 'json' or 'csv'
    format: 'json',
    // options: 'stdout' or 'file' (set in config.outFile)
    writer: 'file',
    outFile: 'scrape_output.json'
});

pjs.addSuite({
    // single URL or array
    url: 'http://veekun.com/dex/moves/search?sort=name&introduced_in=1&introduced_in=2&introduced_in=3&introduced_in=4&introduced_in=5&introduced_in=6',
    // single function or array, evaluated in the client
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
