"use strict";

// https://www.npmjs.com/package/prompt-sync
import Prompt from 'prompt-sync';
import Game from './Game.mjs';

/**
 * Menu manager
 */
export default class Menu {
   constructor( game ){
      this.game = game;
      this.config = [];
      this.promptObj = new Prompt({ sigint: true });
   }

   /**
    * Indented prompt
    */
   prompt(msg){
      return this.promptObj(
         Game.promptFormat( Game.indent + msg )
      );
   }

   /**
    * Render the menu
    */
   render(config){
      this.config = config;

      // Render array of menu entries
      const reducer = (out, opt, i) =>
         out += `(${i}) ${opt.title}\n`;

      return config.reduce( reducer, `[[Menu]]\n` )
         + `${ Game.menuIndexFormat( 'Ⓠ' ) }  Quit (with autosave)`;
   }

   /**
    * Get and process user menu choice
    */
   getCommand(){
      const input = this.prompt( 'Choose a menu item ܀ ' ).trim().toLowerCase();

      // `q` to quit
      if( 'q' === input ){
         this.game.quit();
         return;
      }

      // Pressing ENTER in submenu chooses first entry
      // Check for valid menu choice
      const i = '' !== input.trim() ? parseInt( input )-1 : 0;
      const menuItem = this.config[i];

      // Menu item has an action
      if( menuItem && menuItem.action) return( menuItem.action() );

      // Menu item doesn't exist
      return 'Invalid choice';
   }
};