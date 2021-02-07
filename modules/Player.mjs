"use strict";

import Character from "./Character.mjs";

/**
 * Player class
 */
export default class Player extends Character {
   constructor( game ){
      super( game );
      this.dice = game.dice;
      this.state.attributes.name = "Anonymous Player";
      this.alwaysVisible = true;

      // Add extra player attributes
      const a = this.state.attributes = {
         ...this.state.attributes,
         luck: 0,
         magic: 0,
         gold: 10
      }

      // Store initial values of skill,
      // stamina & luck to impose limits
      const l = this.state.attributeLimits = {
         skill: 0,
         stamina: 0,
         luck: 0
      }

      // Randomise attributes
      const skillFunc = ()=> this.dice.roll(2) + 6;
      const stamFunc = ()=> this.dice.roll(2) + 12
      const luckFunc = ()=> this.dice.roll(1) + 6;
      const magicFunc = ()=> this.dice.roll(2);

      a.skill = l.skill = skillFunc();
      a.stamina = l.stamina = stamFunc();
      a.luck = l.luck = luckFunc();
      a.magic = magicFunc();

   }

   /**
    * Warn if attribute has an initial value
    * which the change will make it exceed
    */
   setAttr( attr, value ){

      const limits = this.state.attributeLimits;

      if( !limits[attr] ) return super.setAttr( attr, value );

      if( parseInt(value) <= limits[attr] ) {
         return super.setAttr( attr, value );
      }

      // Get user confirmation
      const accept = this.prompt(
         `Update ${attr} maximum value? [y/n]`
      );

      if( accept.toLowerCase() !== 'y' ) {
         return `Attribute change cancelled`;
      }

      // Update attribute limit
      limits[attr] = parseInt(value);
      return super.setAttr( attr, value );
   }

   /**
    * Test player's luck & reduce luck attribute by 1
    */
   testLuck(returnBool = false){

      const out = [];
      let lucky;

      if( this.state.attributes.luck < 1 ) {
         lucky = false;
         out.push( "No luck points" );
      } else {
         const diceResult = this.dice.roll(2);
         //out.push(`You rolled ${diceResult}`);
         lucky = diceResult <= this.state.attributes.luck;
         this.state.attributes.luck -= 1;
      }

      out.push( this.getLuckAscii( lucky ));

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
      const menu = [
         {
               title: "Test your luck",
               action: ()=> this.testLuck()
         }
      ];

      return [
         ...super.getMenuOpen(),
         ...menu
      ]
   }

   getRender(){
      return this.isMenuOpen ? super.getRender() : super.getRenderShort()
   }
}