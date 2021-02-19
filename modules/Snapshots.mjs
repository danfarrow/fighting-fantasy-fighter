"use strict";

import AbstractCollectionModule from './AbstractCollectionModule.mjs';
import fs from 'fs';

/**
 * Snapshot the game state at a particular location
 */
export default class Snapshots extends AbstractCollectionModule {

   constructor( game ){
      super( game );
      this.fs = fs;

      this.captions = {
         ...this.captions,
         addMenu: 'Save snapshot',
         addMenuVerbose: `Save snapshot`,
         removeMenu: 'Delete snapshot',
         removeAllMenu: 'Delete all snapshots',
         removePrompt: 'Delete snapshot #',
         notFound: 'Snapshot #$ not found',
         added: 'Reference $ snapshot saved',
         removed: 'Snapshot deleted',
         removeAll: 'All snapshots deleted'
      }
   }

   /**
    * Add a new snapshot as { section, note, state }
    */
   add(){
      const section = this.numberPrompt( `Current reference #` );
      const note = this.prompt( `Add a description` );

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

      // Call `postRestore` hook on all modules
      for( const module of this.game.modules ){
         module.postRestore();
      }

      if( count ){
         return `Reference ${ section } snapshot restored`;
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
      const menu = super.getMenuOpen();

      // If there are snapshots, add management options
      if ( this.state.a.length ){
         menu.push(
            {
               title: 'Restore snapshot',
               action: ()=>this.restore()
            }
         );
      }

      menu.push(
         {
            title: 'Export game to disk',
            action: ()=>this.export( this.prompt( 'Export filename' ))
         },
         {
            title: 'Import game from disk',
            action: ()=>this.import( this.prompt( 'Import filename' ))
         }
      );

      return menu;
   }
}