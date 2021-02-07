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

      return `${item} was added to inventory`;
   }

   remove(){

      const itemNumber = parseInt( this.prompt( `Remove item #` ) );
      const item = this.state.a[ itemNumber ];

      if( item === undefined ) {
         return `Item ${itemNumber} not found`;
      }

      // Remove item
      this.state.a = this.arrayPluck( this.state.a, itemNumber );

      // Autoclose menu item
      this.close();

      return `${item} was dropped`;
   }

   getRender(){
      if( !this.state.a.length ) return `[Inventory empty]`;
      return this.state.a.reduce(
         ( output, item, i ) => `${output}\n(${i}) ${item}`,
         `__Inventory__`
      );
   }

   getMenuOpen(){
      return [
         ...super.getMenuOpen(),
         {
            title: "Add",
            action: ()=>this.add()
         },
         {
            title: "Drop",
            action: ()=>this.remove()
         }
      ]
   }
}
