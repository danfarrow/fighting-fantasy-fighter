"use strict";

import Character from './Character.mjs';
import Game from './Game.mjs';

/**
 * Player class
 */
export default class Player extends Character {

   constructor( game ){

      // Randomise attributes
      const skillFunc = ()=> game.dice.rollQuiet( 2 ) + 6;
      const stamFunc = ()=> game.dice.rollQuiet( 2 ) + 12
      const luckFunc = ()=> game.dice.rollQuiet( 1 ) + 6;

      const skill = skillFunc();
      const stamina = stamFunc();
      const luck = luckFunc();

      super( game, 'Anonymous Player', skill, stamina );

      // Add extra player attributes
      const a = this.state.attributes = {
         ...this.state.attributes,
         luck: luck
      }

      // Add initial value for luck
      this.state.initialValues.luck = luck;

      // Formatting for title, attribute bars, dice ASCII
      this.format = Game.playerFormat;
      this.headerFormat = Game.playerHeaderFormat;

      // this.opponents = [];
      // this.state.opponentStates = [];
   }

   /**
    * Attack the supplied opponent
    * defend against other opponents
    */
   attack( opponent, otherOpponents = [] ){

      // Instant Death rule: if player throws a double, opponent dies
      const instantDeathRule = true;

      // Get attack strengths
      const {
         total: playerAttack,
         isDouble,
         status: playerStatus,
         ascii: playerAscii
      } = this.getAttackStrength();

      const {
         total: opponentAttack,
         status: opponentStatus,
         ascii: opponentAscii
      } = opponent.getAttackStrength();

      // Damage amount
      const damage = 2;

      // Add attacks to output
      const output = [ playerStatus, opponentStatus ];

      // Check for Instant Death
      if( isDouble && instantDeathRule ){

         // Show special ascii dice
         this.status.push( Game.instantDeathFormat( playerAscii ) );

         // Replace attack strengths output
         output.pop();
         output.pop();
         output.push(
            'INSTANT DEATH',
            opponent.damage( opponent.getAttr( 'stamina' ))
         );

         return { output, loser: opponent }
      }

      // Check for miss, or calculate loser
      let loser;

      if( playerAttack === opponentAttack ){

         loser = null;

      } else {

         loser = playerAttack < opponentAttack ? this : opponent;
         output.push( loser.damage( damage ));

      }

      // Show colour formatted dice rolls
      this.status.push( this.format( playerAscii ));
      opponent.status.push( opponent.format( opponentAscii ));

      return { playerAttack, opponentAttack, loser, output }
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
      return `${ attrName } {${ v }/${ limit }}`;
   }

   /**
    * Test player's luck & reduce luck attribute by 1
    */
   testLuck( returnBool = false ){

      const out = [];
      let lucky = false;

      if( this.state.attributes.luck < 1 ) {

         lucky = false;
         out.push( 'No luck points' );

      } else {

         const total = this.game.dice.rollQuiet( 2 );
         lucky = total <= this.state.attributes.luck;
         this.setAttr( 'luck', this.getAttr( 'luck' ) - 1 );

      }

      this.status.push( this.getLuckAscii( lucky ));
      out.push( lucky ? 'Lucky!' : 'Unlucky!' );
      return returnBool ? lucky : out.join( `\n` );
   }

   /**
    * Return ascii string of lucky / unlucky
    */
   getLuckAscii( lucky ){
      const arr = lucky ?
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

      const txt = arr.join( `\n` );
      return lucky ?
         Game.playerFormat( txt ) :
         Game.characterDamageFormat( txt );
   }

   getMenuOpen(){
      return this.getMenu( super.getMenuOpen() );
   }

   /**
    * Add player specific items to menu
    */
   getMenu(){

      const menu = super.getMenuOpen();

      if( this.getAttr('luck') > 0 ){

         const luck = this.getAttr('luck');
         const luckCount = `{${ luck }}`;

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