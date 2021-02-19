"use strict";

import AbstractModule from './AbstractModule.mjs';

/**
 * Inventory manager
 */
export default class Inventory extends AbstractModule {
   constructor( game ){
      super( game );
      this.alwaysVisible = true;
      this.state.a = [];
   }

   add(){
      const item = this.prompt( `Add item name` );

      this.state.a.push( item );

      // Autoclose menu item
      this.close();

      return this.added( item );
   }

   remove(){
      const n = this.numberPrompt( `Remove item #` );
      const item = this.state.a[ n - 1 ];

      if( item === undefined ) {
         return `Item ${n} not found`;
      }

      // Remove item
      this.state.a = this.arrayPluck( this.state.a, n - 1 );

      // Autoclose menu item
      this.close();
      return this.removed( item );
   }

   // To be overridden by subclass
   added( item ){ return `${ item } was added to inventory` }
   removed( item ){ return `${ item } was dropped` }

   /**
    * Remove all items
    */
   removeAll(){

      if( !this.yesNoPrompt( `Are you sure?`) ){
         return `Cancelled`;
      }

      this.state.a = [];
      this.close();
      return `${ this.moduleName } cleared`;
   }

   /**
    * Get view content for this module
    */
   getRender(){
      // If empty then don't render anything
      if( !this.state.a.length ) return;

      return this.state.a.reduce(
         ( output, item, i ) => `${output}\n(${i}) ${item}`,
         `[[${ this.moduleName }]]`
      );
   }

   getMenuOpen(){
      const opts = [
         ...super.getMenuOpen(),
         {
            title: 'Add inventory item',
            action: ()=>this.add()
         }
      ];

      if( this.state.a.length ){
         opts.push(
            {
               title: 'Drop',
               action: ()=>this.remove()
            },
            {
               title: 'Drop all…',
               action: ()=>this.removeAll()
            }
         );
      }

      return opts;
   }
}
