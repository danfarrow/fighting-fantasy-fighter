"use strict";

import Character from "./Character.mjs";
import Game from './Game.mjs';

/**
 * Player class
 */
export default class Player extends Character {

   constructor( game ){

      // Randomise attributes
      const skillFunc = ()=> game.dice.roll(2) + 6;
      const stamFunc = ()=> game.dice.roll(2) + 12
      const luckFunc = ()=> game.dice.roll(1) + 6;
      const goldFunc = ()=> 0;

      const skill = skillFunc();
      const stamina = stamFunc();
      const luck = luckFunc();
      const gold = goldFunc();

      super( game, 'Anonymous Player', skill, stamina );

      // Player info always displays
      this.alwaysVisible = true;

      // Add extra player attributes
      const a = this.state.attributes = {
         ...this.state.attributes,
         luck: luck,
         gold: gold
      }

      // Add initial value for luck
      this.state.initialValues.luck = luck;

      // Formatting for dice ASCII
      this.diceFormat = Game.diceFormat;
   }

   /**
    * Return attribute Name [value/limit]
    */
   getAttrCaption( attr, capitalise = false ){

      attr = attr.toLowerCase();
      if( !this.state.attributes[attr] ) return;

      if( !this.state.initialValues[attr] ){
         return super.getAttrCaption( attr, capitalise );
      }

      const attrName = capitalise ? this.capitaliseFirst( attr ) : attr;
      const v = this.state.attributes[attr];
      const limit = this.state.initialValues[attr];
      return `${ attrName } ${ Game.mCountFormat( `[${ v }/${ limit }]` ) }`;
   }

   /**
    * Test player's luck & reduce luck attribute by 1
    */
   testLuck( returnBool = false ){

      const out = [];
      let lucky = false;

      if( this.state.attributes.luck < 1 ) {

         lucky = false;
         out.push( "No luck points" );

      } else {

         const diceValue = this.rollDice();
         lucky = diceValue <= this.state.attributes.luck;
         this.setAttr( 'luck', this.getAttr( 'luck' ) - 1 );

      }

      out.push( lucky ? 'Lucky!' : 'Unlucky!' );
      return returnBool ? lucky : out.join( `\n` );
   }

   /**
    * Return ascii string of lucky / unlucky
    */
   getLuckAscii(lucky){
      const out = lucky ?
         [
            " _   _   _  ___ _  ____   __",
            "| | | | | |/ __| |/ /\\ \\ / /",
            "| |_| |_| | (__| ' <  \\ V / ",
            "|____\\___/ \\___|_|\\_\\  |_|  "
         ]:[
            " _   _ _  _ _   _   _  ___ _  ____   __",
            "| | | | \\| | | | | | |/ __| |/ /\\ \\ / /",
            "| |_| | .` | |_| |_| | (__| ' <  \\ V / ",
            " \\___/|_|\\_|____\\___/ \\___|_|\\_\\  |_|  "
         ];

      return `${out.join(`\n`)}`;
   }

   getMenuOpen(){
      return this.getMenu( super.getMenuOpen() );
   }

   getMenuClosed(){
      return this.getMenu( super.getMenuClosed() );
   }

   getMenu( menu ){

      const stamina = this.getAttr( 'stamina' );

      menu.push(
         {
            title: `Roll dice`,
            action: ()=> `You rolled ${ this.rollDice() }`
         }
      );

      if( this.getAttr('luck') > 0 ){
         const luck = this.getAttr('luck');
         const luckCount = Game.mCountFormat( `[${ luck }]` );

         menu.push(
            {
               title: `Test luck ${ luckCount }`,
               action: ()=> this.testLuck()
            }
         )
      };

      return menu;
   }
}