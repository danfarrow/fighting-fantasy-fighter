"use strict";

import Inventory from "./Inventory.mjs";
import Game from "./Game.mjs";

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
      const opts = [
         {
            title: `${this.moduleName} ${ Game.indexFormat(`×`) }`, //[⊗]`,
            action: ()=>this.close()
         },
         {
            title: "Add",
            action: ()=>this.add()
         }
      ];

      if( this.state.a.length ){
         opts.push({
            title: "Remove",
            action: ()=>this.remove()
         });
      }

      return opts;
   }
}
