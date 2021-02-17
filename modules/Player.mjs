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

      // Add extra player attributes
      const a = this.state.attributes = {
         ...this.state.attributes,
         luck: luck,
         gold: gold
      }

//      this.setAttr( 'luck', luck );
//      this.setAttr( 'gold', gold );

      // Add initial value for luck
      this.state.initialValues.luck = luck;

      // Formatting for title, attribute bars, dice ASCII
      this.format = Game.playerFormat;
      this.headerFormat = Game.playerHeaderFormat;
   }

   /**
    * Add opponent
    */
   addOpponent(){

      const opponent = new Character( this.game );

      this.opponent = opponent;

      // Push character as second module, after player
      this.game.modules.shift();
      this.game.modules.unshift( opponent );
      this.game.modules.unshift( this );

      // Store reference to opponent state in local state
      this.state.opponentState = this.opponent.state;

      return opponent;
   }

   /**
    * Return opponent or instantiate from this.state
    */
   getOpponent(){
      if( !this.opponent ){

         // Attempt to restore from stored state
         const opponent = this.restoreOpponent();
         if( !opponent ) return;

         this.opponent = opponent;
      }

      return this.opponent;
   }

   /**
    * Restore opponent from stored state
    */
   restoreOpponent(){

      if( !this.state.opponentState ) return;

      // Instantiate opponent with copy of stored state
      const opponent = new Character(
         this.game,
         this.state.opponentState.attributes.name,
         this.state.opponentState.attributes.skill,
         this.state.opponentState.attributes.stamina
      );

      // Push character as second module, after player
      this.game.modules.shift();
      this.game.modules.unshift( opponent );
      this.game.modules.unshift( this );

      // Now overwrite local state with opponent's state obj
      this.state.opponentState = {...opponent.state};
      return opponent;
   }

   /**
    * Return attribute in player format `Name [value/initial]`
    */
   getAttrCaption( attr, capitalise = false ){

      attr = attr.toLowerCase();

      // Check for attribute in state, whilst respecting zero values
      if( !Object.keys(this.state.attributes).includes( attr ) ) return;

      // `!this.state.initialValues` little bugfix :(
      if( !this.state.initialValues || !this.state.initialValues[attr] ){
         return super.getAttrCaption( attr, capitalise );
      }

      const attrName = capitalise ? this.capitaliseFirst( attr ) : attr;
      const v = this.state.attributes[attr];
      const limit = this.state.initialValues[attr];
      return `${ attrName } ${ Game.lowKeyFormat( `[${ v }/${ limit }]` ) }`;
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

   /**
    * Add player specific items to menu
    */
   getMenu(){

      const menu = super.getMenuOpen();
      //    {
      //       title: `Roll dice`,
      //       action: ()=> `You rolled ${ this.rollDice() }`
      //    }
      // ];

      if( this.getAttr('luck') > 0 ){

         const luck = this.getAttr('luck');
         const luckCount = Game.lowKeyFormat( `[${ luck }]` );

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