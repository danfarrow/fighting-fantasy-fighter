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
      this.state.a.push(item);

      // Autoclose menu item
      this.close();

      return `${item} added to inventory`;
   }

   remove(){
      const item = this.prompt( `Remove item` );
      const i = this.state.a.indexOf(item);

      if( i == undefined ) {
         return `${item} not found`;
      }

      // Autoclose menu item
      this.close();

      this.state.a = this.arrayPluck( this.state.a, i );
      return `${item} dropped`;
   }

   getRender(){
      if( !this.state.a.length ) return `[Inventory empty]`;
      return `Inventory:\n` + this.state.a.join(`\n`);
   }

   getMenuOpen(){
      return [
         ...super.getMenuOpen(),
         {
            title: "Add",
            action: ()=>this.add()
         },
         {
            title: "Remove",
            action: ()=>this.remove()
         }
      ]
   }
}
