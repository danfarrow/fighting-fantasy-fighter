"use strict";

import Inventory from "./Inventory.mjs";

/**
 * Notes manager
 */
export default class Notes extends Inventory {
   constructor( game ){
      super( game );
   }

   added( item ){ return `Note added` }
   removed( item ){ return `Note removed` }

   getMenuOpen(){
      return [
         {
            title: `${this.moduleName} [×]`,
            action: ()=>this.close()
         },
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
