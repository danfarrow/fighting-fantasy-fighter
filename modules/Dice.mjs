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
   getMenuClosed(){ return [
      {
         title: 'Roll dice',
         action: ()=> this.roll( 2 )
      }
   ] }

   /**
    * Roll n dice and return total
    */
   rollQuiet( n = 1 ){
      const diceThrows = [];

      while(n--){
         diceThrows.push( Math.ceil( Math.random() * 6 ))
      }

      return diceThrows.reduce(( t, i ) => t + i );
   }

   /**
    * Roll 2 dice
    */
   roll(){
      const roll1 = this.rollQuiet(1);
      const roll2 = this.rollQuiet(1);
      const rolls = [ roll1, roll2 ];
      const ascii = this.getAscii( rolls );
      const isDouble = roll1 === roll2;
      const total = roll1 + roll2;
      return {
         rolls,
         ascii,
         isDouble,
         total
      };
   }

   /**
    * Render supplied numbers as ascii dice
    */
   getAscii( numbers ){
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

      return asciiArr.join(`\n`);
   }
}
