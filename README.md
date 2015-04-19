# Slack-Pokemon

This is a bot for having Pokemon battles within [Slack](https://slack.com/). It was originally built at Vox Media's product hackathon, [Vax](http://product.voxmedia.com/2014/7/3/5861220/vax-14-the-things-we-built). Read more about it [here](http://www.polygon.com/2014/6/27/5850720/pokemon-battle-slack-vox).

Here's an example battle:

<img src="http://cdn3.vox-cdn.com/assets/4681633/pkmn_slack.jpg" alt="Example Battle">

## Setting up

This is written in [Node.js.](http://nodejs.org) After installing Node, you also need to install [npm](https://npmjs.org) and [Redis.](http://redis.io/)

### Spinning up a server

I use [Heroku](http://heroku.com). For a guide on setting up Node and Redis with Heroku, check [here](https://devcenter.heroku.com/articles/getting-started-with-nodejs) and [here](https://addons.heroku.com/redistogo). 

Please note that there is some RedisToGo/Heroku specific code in `state-machine.js`. Don't use that if you're using some other type of server.

### Running locally

To run locally, start Redis in a new tab:

```Shell
$ redis-server
```

and then start the node app:

```Shell
$ npm start
```

This should build dependencies for you and run `index.js`. 

Your app should now be running on `localhost:5000`.

To test locally, you'll have to send some POST commands to `localhost:5000/commands`. Here's a one-liner to test starting a battle:

```Shell
$ curl -d '{"text":"pkmn battle me"}' -H 'Content-Type:application/json' "localhost:5000/commands"
```

To test other commands, change the text in the JSON object above.

### On Slack's end

Set up an [Outgoing Webhook Integration](https://my.slack.com/services/new/outgoing-webhook) with the trigger word 'pkmn' that sends  to the URL: `your-url.herokuapp.com/commands/` (or whatever your equivalent URL is if you're not using Heroku). You'll need admin access to your Slack Integration to do this.

To get the bot's avatar to work, you need to set up a [Custom Emoji](https://my.slack.com/customize/emoji) with the name ':pkmntrainer:'. Use the included `pkmntrainer.png` image, or a custom one if you prefer.

##How to play 

List of commands:

`pkmn battle me`: starts a battle. chooses a pokemon for the NPC.

`pkmn i choose <pokemon>`: chooses a pokemon for the user. Replies with a list of usable moves.

`pkmn use <attack>`: uses an attack. If the pokemon doesn't know that attack, it will respond with an error. You can type the attack with hyphens (hyper-beam) or with spaces (will o wisp).

`pkmn end battle`: end the battle before someone wins. You can also use this to end battles someone else started but never finished.

##Features

Currently the battle system is a tiny fraction of Pokemon's actual battle system. It supports:

- one battle between a user and an NPC
- one pokemon per player (of any currently existing pokemon from Bulbasaur to Zygarde. No Volcanion, Diancie, or Hoopa.)
- moves with appropriate power and type effectiveness (moves can be Super Effective or Not Effective, etc.)

It currently does not support:

- taking stats into account when calculating damage (including accuracy and critical hits)
- levels, or stats based on levels (including EVs and IVs)
- ANY non-damaging moves
- secondary effects of damaging moves (status, buffs/debuffs, multi-hits)
- items and abilities
- multiple concurrent battles
- player vs player battles

###Developing New Features: PJScrape and Supplementary JSON

If you wish to develop new features for this, you will likely run into a situation in which PokeAPI's data isn't sufficient. This happened to me with move types. I ended up scraping the data with [PJScrape](http://nrabinowitz.github.io/pjscrape/) from an external website. The folder `supplemental_json` contains both the scraped data in JSON format as well as the config file passed to PJScrape in order to generate the data.

If you end up needing to scrape a page for supplemental data, please take a look at that folder.

##Contact

Feel free to message me on Twitter, [@RobertVinluan](http://twitter.com/robertvinluan). For now I'm making small updates but not adding features. If you would like to add a feature please submit a pull request. I promise I'll look at it (and probably approve it)!
