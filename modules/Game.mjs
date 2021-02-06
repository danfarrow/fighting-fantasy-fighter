"use strict";

import clc from 'cli-color';
import fs from 'fs';
import Menu from "./Menu.mjs";
import Dice from "./Dice.mjs";
import Player from "./Player.mjs";
import Snapshots from "./Snapshots.mjs";
import Inventory from "./Inventory.mjs";
import Encounters from "./Encounters.mjs"

/**
 * Game manager
 */
export default class Game {
   constructor(){
      this.status = "Welcome!";

      // Output indentation
      this.indent = `    `;

      // Instantiate modules
      this.menu = new Menu( this );
      this.dice = new Dice( this );
      this.player = new Player( this );
      this.inventory = new Inventory( this );
      this.snapshots = new Snapshots( this );
      this.encounters = new Encounters( this );

      this.modules = [
         this.player,
         this.inventory,
         this.encounters,
         this.snapshots,
         this.dice
      ];

      // Try to load autosave
      this.snapshots.import( 'autosave' );

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
      const spacer = `\n${"―·――――·―".repeat(5)}\n`;

      process.stdout.write(clc.reset);// Clear screen
      this._();
      this._();
      this._( spacer );
      this._( this.renderModules() );
      this._( spacer );
      this._( `${this.status}` );
      this._( spacer );
      this._( this.menu.render( this.getMenuConfig() ) );
      this._( spacer );
   }

   /**
    * Output text with indentation
    */
   _(txt){

      if( !txt ) return console.log();

      const regex = /\n/gi;
      console.log( this.indent + txt.replace(regex, `\n${ this.indent }`) );
   }

   /**
    * Quit the app
    */
   quit(){
      this._( this.snapshots.export( 'autosave' ) );
      console.log();
      process.exit();
   }

}

// Instantiate game
const game = new Game();