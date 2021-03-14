"use strict";

import fs from 'fs';
import clc from 'cli-color';
import Dice from './Dice.mjs';
import Menu from './Menu.mjs';
import Notes from './Notes.mjs';
import Player from './Player.mjs';
import Opponent from './Opponent.mjs';
import Inventory from './Inventory.mjs';
import Snapshots from './Snapshots.mjs';
import Encounters from './Encounters.mjs';

// https://www.npmjs.com/package/prompt-sync
import Prompt from 'prompt-sync';

/**
 * Game manager
 */
export default class Game {

   // Colour reference is here https://www.npmjs.com/package/cli-color
   static strikeFormat = clc.strike;
   static moduleTitleFormat = clc.xterm(15).bgXterm(31);// White on blue
   static lowKeyFormat = clc.xterm(243).italic;// Light grey
   static highKeyFormat = clc.xterm(15).bold;// White
   static statusFormat = clc.xterm(11).italic;// Yellow
   static playerFormat = clc.xterm(31);
   static playerHeaderFormat = clc.xterm(15).bgXterm(31);
   static opponentFormat = clc.xterm(11);// Yellow
   static opponentHeaderFormat = clc.xterm(0).bgXterm(11);
   static characterDamageFormat = clc.xterm(197);// Red fg
   static characterDamageHeaderFormat = clc.xterm(0).bgXterm(197);// Red bg
   static instantDeathFormat = clc.xterm(15);// White
   static promptFormat = clc.xterm(45).bold;// Vivid blue
   static menuIndexFormat = clc.xterm(45);// Vivid blue

   // Indentation
   static indent = ` `.repeat( 4 );

   constructor(){

      // Prompt used to get user input
      this.promptObj = new Prompt({ sigint: true });

      // Instantiate modules
      this.dice = new Dice( this );
      this.menu = new Menu( this );
      this.notes = new Notes( this );
      this.player = new Player( this );
      this.inventory = new Inventory( this );
      this.snapshots = new Snapshots( this );
      this.encounters = new Encounters( this );

      this.modules = [
         this.player,
         this.encounters,
         this.inventory,
         this.notes,
         this.snapshots,
         this.dice,
      ];

      // Try to load autosave
      this.snapshots.import( 'autosave' );

      // Greet player
      this.status = `Welcome ${ this.player.getName() }`;
      const currentRef = this.player.getAttr( 'reference' );

      if( currentRef ) {
         delete this.player.state.attributes.reference;
         this.status += `\n{Last reference: ${ currentRef }}`;
      }

      //Start input loop
      this.start();
   }

   /**
    * Remove a specific module - used when opponent dies
    */
   removeModule( module ){
      const arr = this.modules;
      const index = arr.indexOf( module );

      if( !index ) return;

      this.modules =
         arr.slice( 0, index )
         .concat( arr.slice( index + 1 ));
   }

   /**
    * Start the input / command loop
    */
   start(){
      while ( true ){
         this.render();
         this.status = this.menu.getCommand();
      }
   }

   /**
    * Combine menu arrays from each module
    */
   getMenuConfig(){
      let menu = [];

      for( const module of this.modules ){
         menu = [ ...menu, ...module.menu() ];
      }

      return menu;
   }

   /**
    * Combine text output of each module
    */
   renderModules(){
      const out = [];

      for( let module of this.modules ){
         const render = module.render();

         // Don't push empty strings
         if( render) out.push(render);
      }

      return out.join(`\n\n`);
   }

   /**
    * Register a new opponent
    */
   registerOpponent( opponent ){
      // Opponent menu entry pushed to bottom of menu
      this.modules.push( opponent );
   }

   /**
    * Restore an opponent from snapshot state object
    */
   restoreOpponents( statesArray ){

      // Reverse states
      statesArray = statesArray.reverse();

      for( const state of statesArray ){
         this.registerOpponent( new Opponent( this, state ));
      }
   }

   /**
    * Return array of current Character modules
    */
   getOpponents(){
      return this.modules.reduce(
         ( opponents, module ) => {
            if(
               module instanceof Opponent
            ){
               opponents.push( module )
            }
            return opponents;
         },
         []
      )
   }

   /**
    * Return number of current living opponents
    */
   getOpponentCount(){
      return this.getOpponents()
         .filter( o => o.isAlive() )
         .length;
   }

   /**
    * Render the GUI
    */
   render(){
      // Clear screen
      process.stdout.write(clc.reset);

      // Render output with spacing & indentation
      this._();
      this._();
      this._( this.renderModules() );
      this._();
      this._( this.menu.render( this.getMenuConfig() ) );
      this._();
      this._( Game.statusFormat(`${ this.status }`) );
      this._();

   }

   /**
    * Output text with indentation
    */
   _( txt ){

      if( !txt ) return console.log();

      // Filter text
      txt = this.fancyNumbers( txt );
      txt = this.fancyHeaders( txt );
      txt = this.fancyStats( txt );

      // Indent output
      const regex = /\n/gi;
      console.log( Game.indent + txt.replace( regex, `\n${ Game.indent }`) );
   }

   /**
    * Replace `(1) First`, `(2) Second`, `(12) Twelfth` etc.
    * with `❶  First`, `❷  Second`, `⓬  Twelfth` etc.
    * Note: extra space added as it looks clearer in the terminal
    */
   fancyNumbers( str ){

      const nums = [
         '❶','❷','❸','❹','❺',
         '❻','❼','❽','❾','❿',
         '⓫','⓬','⓭','⓮','⓯',
         '⓰','⓱','⓲','⓳','⓴'
      ];

      return str.replace(
         /(\(([\d]+)\))/g,
         ( match, p1, p2 ) => {
            const symbol = nums[parseInt( p2 )];
            return Game.menuIndexFormat( symbol ) + ' ';
         }
      );
   }

   /**
    * Replace `[[Header]]` with `Game.moduleTitleFormat( 'Header' )`
    */
   fancyHeaders( str ){
      return str.replace(
         /\[\[(.*)\]\]/g,
         ( match, p1 ) => Game.moduleTitleFormat( ` ${ p1 } ` )
      );
   }

   /**
    * Replace `[Stat]` with `Game.lowKeyFormat( '[Stat]' )`
    */
   fancyStats( str ){
      return str.replace(
         /\{(.*)\}/g,
         ( match, p1 ) => Game.lowKeyFormat( `[${ p1 }]` )
      );
   }

   /**
    * Input prompt, called by AbstractModule
    */
   prompt( msg ){
      msg = this.fancyStats( msg );

      return this.promptObj(
         Game.promptFormat( `${ Game.indent }${ msg } ܀ ` )
      );
   }

   /**
    * Quit the app
    */
   quit(){
      // Ask for current reference
      this.player.setAttr( 'reference', this.prompt( 'Current ref / ENTER to skip') );

      this._( this.snapshots.export( 'autosave' ));
      this._();
      process.exit();
   }

}