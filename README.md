# fighting-fantasy-fighter

__node command line companion app for playing Fighting Fantasy books__

### [Try it online here!](https://repl.it/@danfarrow/fighting-fantasy-fighter)

I introduced my son to [Fighting Fantasy](https://www.fightingfantasy.com/) gamebooks and then became slightly obsessed with making a node cli app, using oop & native javascript modules, to keep track of our playthroughs.

## Features

* Simple menu driven interface with player dashboard & ASCII dice
* Gripping creature battles _(Requires a [Fighting Fantasy](https://www.fightingfantasy.com/) book)_
* Set attributes with absolute (`7`, `8`, `9`) or relative (`+1`, `+3`, `-4`) values
* Add new attributes for flexible gameplay
* Add / remove / clear inventory items & notes
* Save multiple snapshots of current game state
* Export / import entire game state, including snapshots, as JSON
* Prompts user for bookmark on quit & autosaves game state as `autosave.json`

[![asciicast](https://asciinema.org/a/393248.svg)](https://asciinema.org/a/393248)

![Screengrab of the app](./fff-grab.png)

## Usage

* Requires `node` & `npm`
* `npm run install` to install dependencies
* `npm link` to create a global link
* `fff` to run
* Choose menu items by typing the corresponding number

Note: I've only used this on Ubuntu Linux. If you try it on another system please let me know what happens!

## Coming soon

* Add / edit custom game rules
* Simpler inventory management
* Friendlier export interface
* More thrillingness
