"use strict";

import AbstractModule from "./AbstractModule.mjs";

/**
 * Simple dice roll with ascii display
 */
export default class Dice extends AbstractModule {
   constructor( game ){
      super( game );
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

   getMenuClosed(){
      return [
         {
            title: "Roll dice",
            action: ()=>`You rolled ${this.roll(2)}`
         }
      ]
   }

   getMenuOpen(){
      return [
         ...super.getMenuOpen(),
         {
            title: "Roll 1 die",
            action: ()=>`You rolled ${this.roll()}`
         },
         {
            title: "Roll 2 dice",
            action: ()=>`You rolled ${this.roll(2)}`
         }
      ]
   }

   roll(n = 1){
      const diceThrows = [];

      while(n--){
         diceThrows.push(Math.ceil(Math.random() * 6))
      }

      this.status = this.getAscii(diceThrows);
      return diceThrows.reduce((t,i)=>t+=i);
   }

   /**
    * Render supplied numbers as ascii dice
    */
   getAscii(numbers){
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
