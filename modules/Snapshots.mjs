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
      this.state.a = [];
   }

   /**
    * Add a new snapshot as { section, note, state }
    */
   add(){
      const section = this.numberPrompt( `Current section #` );
      const note = this.prompt( `Add a note` );

      this.state.a.push({
         section: section,
         note: note,
         state: this.getGameState()
      });

      // Autoclose menu item
      this.close();
      return this.added( section );
   }


   /**
    * Remove selected snapshot
    */
   remove(){
      const n = this.numberPrompt( `Remove snapshot #` );
      const snapshot = this.state.a[n - 1];

      if( !snapshot ) {
         return `Snapshot ${n} not found`;
      }

      const section = snapshot.section;
      this.state.a = this.arrayPluck( this.state.a, n - 1 );

      // Autoclose menu item
      this.close();
      return this.removed( section );
   }

   // @todo Overridden from superclass
   added( item ){ return `Section ${ item } snapshot saved` };
   removed( item ){ return `Section ${ item } snapshot removed`; }

   /**
    * Remove all items
    */
   removeAll(){

      if( !this.yesNoPrompt( `Are you sure?` )){
         return `Cancelled`;
      }

      this.state.a = [];
      this.close();
      return `${ this.moduleName } cleared`;
   }

   /**
    * Restore snapshot
    */
   restore(){
      const n = this.numberPrompt( `Restore snapshot #` );
      const snapshot = this.state.a[n - 1];

      if( !snapshot ) {
         return `Snapshot ${ n } not found`;
      }

      // Autoclose menu item
      this.close();

      return this.restoreGameState( snapshot );
   }

   /**
    * Show list of snapshots
    */
   getRender(){
      if( !this.state.a ) return;

      // Reduce array of snapshots into list
      return this.state.a.reduce(
         ( output, item, i ) => {
            return `${ output }\n(${ i }) `
               + `${ item.section }: ${ item.note }`;
         },
         `[[${ this.moduleName }]]`
      );
   }

   /**
    * Assemble object representing game state
    */
   getGameState( skipSelf = true ){
      const out = {};

      for( const module of this.game.modules ){
         if( !module.state ) continue;
         if( skipSelf && module === this ) continue;
         const json = JSON.stringify( module.state );
         out[ module.moduleName ] = JSON.parse( json );
      }

      return out;
   }

   /**
    * Restore game state from object
    */
   restoreGameState( snapshot ){

      const section = snapshot.section;
      let count = 0;

      for( const module of this.game.modules ){
         const modName = module.moduleName;

         // Check if module exists in snapshot
         if( !snapshot.state[ modName ] ) continue;

         module.state = snapshot.state[ modName ];
         count++;
      }

      if( count ){
         return `Section ${ section } snapshot restored`;
      }

      return `Could not restore snapshot`;

   }

   /**
    * Assemble JSON representing game state
    */
   getGameStateJson(){
      const state = this.getGameState( false );
      return JSON.stringify( { state: state } );
   }

   /**
    * Export game state to disk
    */
   export( filename ){
      const json = this.getGameStateJson();
      const fullFilename = `${ filename }.json`;

      // Write file to disk
      fs.writeFileSync( `./${ fullFilename }`, json, 'utf8' );
      return( `Game state saved as ${ fullFilename }` );
   }

   /**
    * Import game state from disk
    */
   import( filename ){
      const fullFilename = `${ filename }.json`;
      const filePath = `./${ fullFilename }`;

      // Check if file exists
      if ( !fs.existsSync( filePath )) {
         return `${ fullFilename } not found`;
      }

      const json = this.fs.readFileSync( filePath, 'utf8' );
      this.restoreGameState( JSON.parse( json ));
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
            action: ()=>this.add()
         }
      ];

      // If there are snapshots, add management options
      if ( this.state.a ){
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
            action: ()=>this.export( this.prompt( 'Export filename' ))
         },
         {
            title: "Import game from disk",
            action: ()=>this.import( this.prompt( 'Import filename' ))
         }
      );

      return opts;
   }
}