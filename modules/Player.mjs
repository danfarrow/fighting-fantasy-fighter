"use strict";

import AbstractCharacter from './AbstractCharacter.mjs';
import Game from './Game.mjs';

/**
 * Player class
 */
export default class Player extends AbstractCharacter {

   constructor( game ){
      super( game );

      this.setAttr( 'name', 'Anonymous Player' );

      // Formatting for title, attribute bars, dice ASCII
      this.format = Game.playerFormat;
      this.headerFormat = Game.playerHeaderFormat;
   }

   /**
    * Randomly generate player
    */
   generate( state ){

      if( !this.state.attributes ){
         this.state.attributes = {};
      }

      // Randomise attributes
      const skillFunc = ()=> this.game.dice.rollQuiet( 1 ) + 6;
      const stamFunc = ()=> this.game.dice.rollQuiet( 2 ) + 12
      const luckFunc = ()=> this.game.dice.rollQuiet( 1 ) + 6;

      // Leave name blank so it doesn't
      // get stored in initialValues
      this.setAttr( 'name' );

      this.setAttr( 'skill', skillFunc());
      this.setAttr( 'stamina', stamFunc());
      this.addAttr( 'luck', luckFunc());
   }

   /**
    * Attack the supplied opponent
    * defend against other opponents
    */
   attack( opponent, otherOpponents = [] ){
      const instantDeathRule = false;

      // Get attack strengths
      const {
         total: playerAttack,
         isDouble
      } = this.getAttackStrength();

      const {
         total: opponentAttack
      } = opponent.getAttackStrength();


      const output = [];
      const damage = 2;

      // Resolve clash
      let winner, loser;

      // Instant Death rule: if player throws a double, opponent dies
      if( isDouble && instantDeathRule ){

         // Replace attack strengths output
         opponent.damage( opponent.getAttr( 'stamina' ));
         output.push( 'INSTANT DEATH' );
         winner = this;
         loser = opponent;

      } else if( playerAttack === opponentAttack ){

         // Miss
         winner = null;
         loser = null;

      } else {

         loser = playerAttack < opponentAttack ? this : opponent;
         winner = playerAttack > opponentAttack ? this : opponent;

      }

      if( loser ){
         output.push( loser.damage( damage, winner ) );
      }

      // Get other opponent attacks
      for( const opponent of otherOpponents ){
         const { total } = opponent.getAttackStrength();

         if( total > playerAttack ){
            output.push( this.damage( damage, opponent ));
         } else {
            output.push(
               `${ this.getName() } parried ${ opponent.getName() }`
            );
         }
      }

      return { playerAttack, opponentAttack, loser, output }
   }

   /**
    * Return attribute in player format `Name [value/initial]`
    */
   getAttrCaption( attr, capitalise = false ){

      attr = attr.toLowerCase();

      // Check if attribute exists in state
      // whilst respecting zero values
      if( !Object.keys( this.state.attributes ).includes( attr ) ) return;

      // `!this.state.initialValues` little bugfix
      if( !this.state.initialValues || !this.state.initialValues[ attr ] ){
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
    * Reset output formats
    */
   getRender(){

      const out = super.getRender();

      // Formatting for title, attribute bars, dice ASCII
      this.format = Game.playerFormat;
      this.headerFormat = Game.playerHeaderFormat;

      return out;
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

   /**
    * Add player specific items to menu
    */
   getMenuOpen(){

      const menu = super.getMenuOpen();

      if( this.getAttr('luck') > 0 ){

         const luck = this.getAttr( 'luck' );
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