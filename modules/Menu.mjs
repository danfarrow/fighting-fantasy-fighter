"use strict";

import Prompt from 'prompt-sync';

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
      return this.promptObj( this.game.indent + msg );
   }

   /**
    * Render the menu
    */
   render(config){
      this.config = config;

      // Render array of menu entries
      const reducer = (out, opt, i) =>
         out += `(${i}) ${opt.title}\n`;

      return config.reduce( reducer, `__Menu__\n` )
         + `Ⓠ  Quit (with autosave)`;
   }

   /**
    * Get and process user menu choice
    */
   getCommand(){
      const input = this.prompt( `Choose a menu item ܀ ` );

      // `q` to quit
      if( "q" === input.trim().toLowerCase() ){
         this.game.quit();
         return;
      }

      // Check for valid menu choice
      const i = parseInt(input)-1;
      const menuItem = this.config[i];

      // Menu item has an action
      if( menuItem && menuItem.action) return( menuItem.action() );

      // Menu item doesn't exist
      return `Invalid choice`;
   }
};