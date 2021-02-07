"use strict";

import clc from 'cli-color';
import fs from 'fs';
import Menu from "./Menu.mjs";
import Dice from "./Dice.mjs";
import Notes from "./Notes.mjs";
import Player from "./Player.mjs";
import Snapshots from "./Snapshots.mjs";
import Inventory from "./Inventory.mjs";
import Encounters from "./Encounters.mjs"

/**
 * Game manager
 */
export default class Game {
   constructor(){

      // Output indentation
      this.indent = `    `;

      // Instantiate modules
      this.menu = new Menu( this );
      this.dice = new Dice( this );
      this.notes = new Notes( this );
      this.player = new Player( this );
      this.inventory = new Inventory( this );
      this.snapshots = new Snapshots( this );
      this.encounters = new Encounters( this );

      this.modules = [
         this.player,
         this.inventory,
         this.notes,
         this.encounters,
         this.snapshots,
         this.dice
      ];

      // Try to load autosave
      this.snapshots.import( 'autosave' );

      // Greet player
      this.status = `Welcome ${this.player.getName()}!`;

      //Start input loop
      this.start();
   }

   /**
    * Start the input / command loop
    */
   start(){
      while (true){
         this.render();
         this.status = this.menu.getCommand();
      }
   }

   /**
    * Combine menu arrays from each module
    */
   getMenuConfig(){
      let menuConfig = [];
      for( let module of this.modules ){
         menuConfig = [...menuConfig, ...module.menu()];
      }
      return menuConfig;
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
    * Render the GUI
    */
   render(){
      process.stdout.write(clc.reset);// Clear screen
      this._();
      this._();
      this.__();
      this._( this.renderModules() );
      this.__();
      this._( this.menu.render( this.getMenuConfig() ) );
      this.__();
      this._( `${this.status}` );
      this.__();
   }

   /**
    * Output text with indentation
    */
   _(txt){

      if( !txt ) return console.log();

      // Replace `(1)`, `(2)` etc
      txt = this.fancyNumbers(txt);

      // Indent output
      const regex = /\n/gi;
      console.log( this.indent + txt.replace(regex, `\n${ this.indent }`) );
   }

   /**
    * Output spacer
    */
   __(){
      const spacer = `\n${"―·――――·―".repeat(5)}\n`;
      return this._( spacer );
   }

   /**
    * Replace `(1) First`, `(2) Second`, `(12) Twelfth` etc.
    * with `①  First`, `②  Second`, `⑫  Twelfth` etc.
    * Note extra space added as it looks clearer in the terminal
    */
   fancyNumbers(str){

      const nums =
         ['①','②','③','④','⑤',
          '⑥','⑦','⑧','⑨','⑩',
          '⑪','⑫','⑬','⑭','⑮',
          '⑯','⑰','⑱','⑲','⑳'];

      return str.replace(
         /(\(([\d]+)\))/g,
         (match, p1, p2) => nums[parseInt(p2)] + " "
      );
   }

   /**
    * Quit the app
    */
   quit(){
      this._( this.snapshots.export( 'autosave' ) );
      this._();
      process.exit();
   }

}