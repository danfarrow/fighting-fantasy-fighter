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
      const snapshotNumber = this.prompt( `Save snapshot #` );
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
   delete(){
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
    * Show list of snapshots
    */
   list(){
      let out = ['Snapshots:'];

      if( Object.keys(this.state).length === 0 ) return `[No snapshots]`;

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
    * Export game state to disk
    */
   export( filename ){
      const json = this.exportGameState();

      // Write file to disk
      return fs.writeFileSync(
         `./${filename}.json`,
         json,
         'utf8',
         (err)=>{
            if (err){

               return( `Error writing file: ${err}` );

            } else {

               // Autoclose menu item
               this.close();

               return( `File written` );

            }
         }
      );
   }

   /**
    * Assemble object representing game state
    */
   getGameState(skipSnapshots = true){
      const out = {};

      for( const module of this.game.modules ){
         const modName = module.moduleName;
         if( "Dice" === modName ) continue;
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
   exportGameState(){
      const state = this.getGameState(false);
      return JSON.stringify( state );
   }

   /**
    * Import game state from disk
    */
   import( filename ){
      this.fs.readFile(
         `./${filename}.json`, 'utf8',
         (err, json)=>{
            if(err){
               return( `Error reading file: ${err}` );
            } else {
               this.restoreGameState(JSON.parse(json));
               return( `File loaded` );
            }
         }
      );
   }

   /**
    * Get open menu config
    */
   getMenuOpen(){
      return [
         ...super.getMenuOpen(),
         {
            title: "Save snapshot",
            action: ()=>this.save()
         },
         {
            title: "Restore snapshot",
            action: ()=>this.restore()
         },
         {
            title: "Delete snapshot",
            action: ()=>this.delete()
         },
         {
            title: "Export game to disk",
            action: ()=>this.export( this.prompt( 'Filename' ))
         },
         {
            title: "Import game from disk",
            action: ()=>this.import( this.prompt( 'Filename' ))
         }
      ]
   }

   getRender(){
      if( Object.keys(this.state).length === 0 ) {
         return `[No snapshots]`;
      }

      return this.list();
   }
}