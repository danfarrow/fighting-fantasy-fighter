"use strict";

import AbstractModule from "./AbstractModule.mjs";
import Game from "./Game.mjs";

/**
 * Simple dice roll with ascii display
 */
export default class Dice extends AbstractModule {
   constructor( game ){
      super( game );

      // Dice module not exported
      delete this.state;

      // Was the last throw a double?
      this.double = false;

      this.alwaysVisible = true;
      this.diceAscii = [
         [
            '┏━━━━━━━┓',
            '┃       ┃',
            '┃   •   ┃',
            '┃       ┃',
            '┗━━━━━━━┛'
         ],[
            '┏━━━━━━━┓',
            '┃  •    ┃',
            '┃       ┃',
            '┃    •  ┃',
            '┗━━━━━━━┛'
         ],[
            '┏━━━━━━━┓',
            '┃ •     ┃',
            '┃   •   ┃',
            '┃     • ┃',
            '┗━━━━━━━┛'
         ],[
            '┏━━━━━━━┓',
            '┃ •   • ┃',
            '┃       ┃',
            '┃ •   • ┃',
            '┗━━━━━━━┛'
         ],[
            '┏━━━━━━━┓',
            '┃ •   • ┃',
            '┃   •   ┃',
            '┃ •   • ┃',
            '┗━━━━━━━┛'
         ],[
            '┏━━━━━━━┓',
            '┃ •   • ┃',
            '┃ •   • ┃',
            '┃ •   • ┃',
            '┗━━━━━━━┛'
         ]
      ];

   }

   // Dice are not on the menu
   getMenuClosed(){ return [] }

   /**
    * Roll n dice
    */
   roll( n = 1 ){
      const diceThrows = [];

      while(n--){
         diceThrows.push( Math.ceil( Math.random() * 6 ))
      }

      return diceThrows.reduce(( t, i ) => t + i );
   }

   /**
    * Render supplied numbers as ascii dice
    */
   getAscii( numbers, format = Game.playerFormat ){
      let asciiArr;

      for(let i of numbers){
         const ascii = this.diceAscii[i-1];
         if( !asciiArr ){
            asciiArr = ascii;
         } else {
            // Combine each array item to show dice side by side
            asciiArr = asciiArr.map((a, i) => `${a} ${ascii[i]}`);
         }
      }

      return format( asciiArr.join(`\n`) );
   }
}
