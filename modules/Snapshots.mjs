"use strict";

import AbstractModule from "./AbstractModule.mjs";
import fs from 'fs';

/**
 * Snapshot the game state at a particular location
 */
export default class Snapshots extends AbstractModule {

   constructor( game ){
      super( game );
      this.fs = fs;
      this.state = {};
   }

   /**
    * Add a new snapshot
    */
   save(){
      const snapshotNumber = this.prompt( `Snapshot section #` );
      const number = parseInt( snapshotNumber );
      if( isNaN(number) ) return `Please enter a number`;

      const note = this.prompt( `Snapshot note` );

      this.state[number] = this.getGameState();
      this.state[number].note = note;

      // Autoclose menu item
      this.close();

      return `Snapshot ${number} was saved`;
   }

   /**
    * Remove selected snapshot
    */
   remove(){
      const snapshotNumber = this.prompt( `Remove snapshot #` );
      const number = parseInt( snapshotNumber );

      if( !this.state[number] ) {
         return `Snapshot ${number} not found`;
      }

      delete this.state[number];

      // Autoclose menu item
      this.close();

      return `Snapshot ${number} was removed`;
   }

   /**
    * Remove all items
    */
   removeAll(){
      if( this.yesNoPrompt( `Are you sure?`) ){
         this.state = {};
         return `${this.moduleName} cleared`;
      } else {
         return `Remove all cancelled`;
      }
   }

   /**
    * Show list of snapshots
    */
   getRender(){
      let out = ['[[Snapshots]]'];

      if( !Object.keys(this.state).length ) return;

      for( const snapshot in this.state ) out.push(`${snapshot} ${this.state[snapshot].note}`);
      return out.join(`\n`);
   }

   /**
    * Restore snapshot
    */
   restore(){
      const snapshotNumber = this.prompt( `Restore snapshot #` );
      const number = parseInt( snapshotNumber );
      const snapshotObj = this.state[number];

      if( !snapshotObj ) {
         return `Snapshot ${number} not found`;
      }

      if( this.restoreGameState(snapshotObj) ){

         // Autoclose menu item
         this.close();
         return `Snapshot ${number} restored`;

      } else {

         return `Could not restore snapshot ${number}`;

      }
   }

   /**
    * Assemble object representing game state
    */
   getGameState(skipSnapshots = true){
      const out = {};

      for( const module of this.game.modules ){
         const modName = module.moduleName;
         if( !module.state ) continue;
         if( skipSnapshots && module === this ) continue;
         out[modName] = JSON.parse( JSON.stringify( module.state ));
      }

      return out;
   }

   /**
    * Restore game state from object
    */
   restoreGameState(snapshotObj){
      const restoredModules = [];

      for( const module of this.game.modules ){
         const modName = module.moduleName;

         // Check if module exists in snapshotObj
         if( !snapshotObj[modName] ) continue;

         module.state = snapshotObj[modName];
         restoredModules.push(modName);
      }

      return restoredModules.length > 0;
   }

   /**
    * Assemble JSON representing game state
    */
   getGameStateJson(){
      const state = this.getGameState(false);
      return JSON.stringify( state );
   }

   /**
    * Export game state to disk
    */
   export( filename ){
      const json = this.getGameStateJson();
      const fullFilename = `${filename}.json`;

      // Write file to disk
      fs.writeFileSync(`./${fullFilename}`, json, 'utf8');
      return( `Game state saved as ${fullFilename}` );
   }

   /**
    * Import game state from disk
    */
   import( filename ){
      const fullFilename = `${filename}.json`;
      const filePath = `./${fullFilename}`;

      // Check if file exists
      if ( !fs.existsSync(filePath) ) {
         return `${fullFilename} not found`;
      }

      const json = this.fs.readFileSync( filePath, 'utf8' );
      this.restoreGameState(JSON.parse(json));
      return( `${fullFilename} imported` );
   }

   /**
    * Get open menu config
    */
   getMenuOpen(){
      const opts = [
         ...super.getMenuOpen(),
         {
            title: "Save snapshot",
            action: ()=>this.save()
         }
      ];

      if ( Object.keys(this.state).length ){
         opts.push(
            {
               title: "Restore snapshot",
               action: ()=>this.restore()
            },
            {
               title: "Delete snapshot",
               action: ()=>this.remove()
            },
            {
               title: "Delete all…",
               action: ()=>this.removeAll()
            }
         );
      }

      opts.push(
         {
            title: "Export game to disk",
            action: ()=>this.export( this.prompt( 'Filename' ))
         },
         {
            title: "Import game from disk",
            action: ()=>this.import( this.prompt( 'Filename' ))
         }
      );

      return opts;
   }
}
