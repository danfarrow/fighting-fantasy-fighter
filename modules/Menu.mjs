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

      const nums =
         ['①','②','③','④','⑤',
          '⑥','⑦','⑧','⑨','⑩',
          '⑪','⑫','⑬','⑭','⑮',
          '⑯','⑰','⑱','⑲','⑳']

      // Render config array as numbered options
      // Items < 10 have a double space after
      // to keep everything lined up
      const reducer = (out, opt, i) =>
         out += `${ nums[i] }  ${opt.title}\n`;

      return `Menu:\n\n`
         + config.reduce( reducer, `` )
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