"use strict";

import AbstractModule from "./AbstractModule.mjs";

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
      const input = this.prompt( `Remove item #` );
      const itemNumber = parseInt( input ) - 1;
      const item = this.state.a[ itemNumber ];

      if( item === undefined ) {
         return `Item ${input} not found`;
      }

      // Remove item
      this.state.a = this.arrayPluck( this.state.a, itemNumber );

      // Autoclose menu item
      this.close();

      return this.removed(item);
   }

   /**
    * Remove all items
    */
   removeAll(){

      if( this.yesNoPrompt( `Are you sure?`) ){
         this.state.a = [];
         this.close();
         return `${this.moduleName} cleared`;
      }

      return `Cancelled`;
   }

   // To be overridden by subclass
   added( item ){ return `${item} was added to inventory` }
   removed( item ){ return `${item} was dropped` }

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
            title: "Add",
            action: ()=>this.add()
         }
      ];

      if( this.state.a.length ){
         opts.push(
            {
               title: "Drop",
               action: ()=>this.remove()
            },
            {
               title: "Drop all…",
               action: ()=>this.removeAll()
            }
         );
      }

      return opts;
   }
}
