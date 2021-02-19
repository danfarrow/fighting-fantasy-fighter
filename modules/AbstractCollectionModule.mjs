"use strict";

import AbstractModule from './AbstractModule.mjs';

/**
 * Abstract class defining common functionality for
 * game modules that comprise of a collection of entries
 * i.e. Inventory, Notes, Snapshots
 */
export default class AbstractCollectionModule extends AbstractModule {
   constructor( game ){
      super( game );
      this.state.a = [];

      this.captions = {
         addMenu: 'Add item',
         addMenuVerbose: `Add ${ this.moduleName.toLowerCase() } item`,
         removeMenu: 'Remove item',
         removeAllMenu: 'Remove all',
         addPrompt: 'Add item',
         removePrompt: 'Remove item #',
         notFound: 'Item #$ not found',
         added: '$ was added',
         removed: '$ was removed',
         removeAll: `${ this.moduleName } cleared`
      }
   }

   add(){
      const item = this.prompt( this.captions.addPrompt );

      this.state.a.push( item );

      // Autoclose menu item
      this.close();

      return this.added( item );
   }

   remove(){
      const n = this.numberPrompt( this.captions.removePrompt );
      const item = this.state.a[ n - 1 ];

      if( item === undefined ) {
         return this.captions.notFound.replace( '$', n );
      }

      // Remove item
      this.state.a = this.arrayPluck( this.state.a, n - 1 );

      // Autoclose menu item
      this.close();

      return this.removed( item );
   }

   // To be overridden by subclass
   added( item ){ return this.captions.added.replace( '$', item ) }
   removed( item ){ return this.captions.removed.replace( '$', item ) }

   /**
    * Remove all items
    */
   removeAll(){

      if( !this.yesNoPrompt( `Are you sure?`) ){
         return `Cancelled`;
      }

      this.state.a = [];
      this.close();
      return this.captions.removeAll;
   }

   /**
    * Get view content for this module
    */
   getRender(){
      // If empty then don't render anything
      if( !this.state.a.length ) return;

      return this.state.a.reduce(
         ( output, item, i ) => `${ output }\n(${ i }) ${ item }`,
         `[[${ this.moduleName }]]`
      );
   }

   getMenuOpen(){

      // If inventory is empty display
      // a more verbose `Add item` message
      const addItemCaption = this.state.a.length ?
         this.captions.addMenu :
         this.captions.addMenuVerbose;

      const opts = [
         ...super.getMenuOpen(),
         {
            title: addItemCaption,
            action: ()=>this.add()
         }
      ];

      if( this.state.a.length ){
         opts.push(
            {
               title: this.captions.removeMenu,
               action: ()=>this.remove()
            },
            {
               title: `${ this.captions.removeAllMenu }…`,
               action: ()=>this.removeAll()
            }
         );
      }

      return opts;
   }
}