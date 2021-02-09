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

   /**
    * Dice roll is always on the menu
    */
   getMenuClosed(){
      return [
         {
            title: "Roll dice",
            action: ()=>`You rolled ${this.rollVisible(2)}`
         }
      ]
   }

   getRender(){
      const st = this.status;
      delete this.status;
      return st;
   }

   /**
    * Roll n dice
    */
   roll( n = 1 ){
      const throws = [];

      while( n-- ){
         throws.push( Math.ceil( Math.random() * 6 ))
      }

      return throws.reduce( ( t, i ) => t += i );
   }

   /**
    * Roll n dice & update status
    */
   rollVisible( n = 1 ){
      const throws = [];

      while( n-- ){
         throws.push( Math.ceil( Math.random() * 6 ))
      }

      this.status = this.getAscii( throws );
      return throws.reduce( ( t, i ) => t += i );
   }

   /**
    * Combat roll displays multiple dice rolls
    *
    *  @return array Array of individual rolls e.g. [1, 6, 3, 4]
    */
   combatRoll( participants = 2 ){
      const throws = [];
      let n = participants * 2;

      while( n-- ){
         throws.push( this.rollVisible( 1 ));
      }

      this.status = this.getAscii( throws );
      return throws;
   }

   /**
    * Render supplied numbers as ascii dice
    */
   getAscii( numbers ){
      let out;

      for ( const [i, n] of numbers.entries() ) {

         // First two dice will use Game.diceFormat
         // Subsequent dice will use Game.diceFormatOpponent
         const format = i < 2 ? Game.diceFormat : Game.diceFormatOpponent;

         // Get ascii array for individual dice number
         const asciiArr = this.diceAscii[ n - 1 ];

         if( !out ){
            // Format first dice ascii array
            out = asciiArr.map( a => `${ format( a ) }` );
         } else {
            // Combine each item of dice ascii arrays
            // to show dice side by side
            out = out.map(( a, i ) => `${ a } ${ format( asciiArr[ i ] ) }` );
         }
      }

      // return Game.diceFormat( out.join(`\n`) );
      return out.join(`\n`);
   }
}
