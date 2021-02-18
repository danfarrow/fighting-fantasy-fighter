"use strict";

import AbstractModule from './AbstractModule.mjs';
import Game from './Game.mjs';

/**
 * Character class
 */
export default class Character extends AbstractModule {

   constructor( game, name, skill, stamina ){

      super( game );

      this.state.attributes = {};
      // this.state.initialValue = {};

      this.setAttr( 'name', name || this.prompt( 'Opponent name' ));
      this.setAttr( 'skill', skill || this.numberPrompt( 'Opponent skill' ));
      this.setAttr( 'stamina', stamina || this.numberPrompt( 'Opponent stamina' ));

      // Character info always displays
      this.alwaysVisible = true;

      // Store initial values of skill, stamina
      this.state.initialValues = {
         skill: this.getAttr( 'skill' ),
         stamina: this.getAttr( 'stamina' )
      }

      // Status buffer for transient messages
      this.status = [];

      // Formatting for title, attribute bars, dice ASCII
      this.format = Game.opponentFormat;
      this.headerFormat = Game.opponentHeaderFormat;

   }

   /**
    * Return the requested attribute
    */
   getAttr( attr ){
      attr = attr.toLowerCase();
      return this.state.attributes[ attr ];
   }

   /**
    * Is this character alive or dead?
    */
   isAlive(){ return this.getAttr( 'stamina' ) > 0 }
   isDead(){ return !this.isAlive() }

   /**
    * Return name struck out if dead
    */
   getName(){
      const name = this.getAttr( 'name' );

      if( this.isAlive() ) return name;

      return Game.strikeFormat( name );
   }

   /**
    * Set an attribute value
    *
    * string attr Name of attribute
    * int/string value Type-checked value
    *
    * @todo Accept relative amounts i.e. `+1`, `-1`
    */
   setAttr( attr, value ){
      if( '' === value ) return `Cancelled`;

      attr = attr.toLowerCase();

      if( 'name' !== attr ){

         // Numeric attribute values cannot be negative
         value = Math.max( value, 0 );
      }

      this.state.attributes[ attr ] = value;

      return `Changed ${ this.getAttrCaption( attr ) }`;
   }

   /**
    * Prompt for input to set attribute value
    */
   getAttrPrompt(attr){
      const caption = `Set ${ this.getAttrCaption( attr ) }`;

      return 'name' === attr ?
         this.prompt( caption )
         : this.numberPrompt( caption );
   }

   /**
    * Return attribute Name [value]
    */
   getAttrCaption( attr, capitalise = false ){

      attr = attr.toLowerCase();

      // Check for attribute in state, whilst respecting zero values
      if( !Object.keys( this.state.attributes ).includes( attr ) ) return;

      const attrValue = this.state.attributes[ attr ];
      const attrName = capitalise ? this.capitaliseFirst( attr ) : attr;
      return `${ attrName } ${ Game.lowKeyFormat( `[${ attrValue }]` )}`;
   }

   /**
    * Title to be displayed in menu for this module
    */
   getMenuTitle(){
      return this.getAttr( 'name' );
   }


   /**
    * Populate menu in open state
    */
   getMenuOpen(){
      // Build dynamic menu to set stats values
      const menu = [];

      for( const attr in this.state.attributes ) {
         menu.push(
            {
               title: this.getAttrCaption( attr, true ),
               action: ()=> this.setAttr( attr, this.getAttrPrompt( attr ))
            }
         );
      }

      return [
         ...super.getMenuOpen(),
         ...menu
      ]
   }

   /**
    * Return full text for character attributes
    */
   getRender(){
      const skill = this.getAttr( 'skill' );
      const stamina = this.getAttr( 'stamina' );
      const stamInit = this.state.initialValues.stamina;
      const stamLost = Math.max( stamInit - stamina, 0 );

      const staminaString =
         this.format( '♥ '.repeat( stamina )) +
         '♡ '.repeat( stamLost ) +
         Game.lowKeyFormat( `[${ stamina }]` );

      const skillString =
         this.format( '⚔ '.repeat( skill )) +
         Game.lowKeyFormat( `[${ skill }]` );

      const out = [ this.headerFormat( ` ${ this.getName() } ` ) ];
      out.push( skillString );
      out.push( staminaString );

      // Add any extra status messages & clear status
      out.push( ...this.status );
      this.status = [];

      return out.join(`\n`);
   }

   /**
    * Return string of attributes in truncated format:
    * e.g. Sk:99 ╱ St:99 ╱ ...
    */
   getAttributesShort(){
      const out = [];
      const include = [ 'skill', 'stamina' ];

      for( const attr of include ){

         const abbr = this.capitaliseFirst( attr ).slice( 0, 2 );
         const v = this.state.attributes[attr];

         out.push( `${ abbr }:${ v }` );
      };

      return out.join(` ╱ `);
   }

   /**
    * Roll 2 dice for this character
    */
   rollDice(){
      const dice = [ this.game.dice.roll(1), this.game.dice.roll(1) ];
//      this.status.push( this.game.dice.getAscii( dice, this.format ));
      return dice.reduce(( t, n ) => t + n );
   }

   /**
    * Return attack strength (2 dice + skill)
    */
   getAttackStrength( diceRoll ){
      return diceRoll + this.getAttr( 'skill' );
   }

   /**
    * Take damage: reduce stamina
    */
   damage( amt ){

      this.setAttr( 'stamina', this.getAttr( 'stamina' ) - amt );

      // Change output format to show damage
      const origFormat = this.format;
      const origHeaderFormat = this.headerFormat;
      this.format = Game.characterDamageFormat
      this.headerFormat = Game.characterDamageHeaderFormat;

      const n = this.getAttr( 'name');

      if( this.isAlive() ){

         // Add post-render functions to revert to original formats
         this.postRenderQueue.push( ()=> this.format = origFormat );
         this.postRenderQueue.push( ()=> this.headerFormat = origHeaderFormat );

         return `${ n } was wounded [${ amt }]!`;
      }

      // Character is dead
      // @todo Better way to check for death?

      // Add post-render function to remove this module
      this.postRenderQueue.push( ()=> this.game.removeModule( this ));

      return `${ n } is dead!`
   }

   /**
    * Heal: increase stamina
    */
   heal( amt ){
      this.setAttr( 'stamina', this.getAttr( 'stamina' ) + amt );
      return `${ this.getName() } was healed [${ amt }]!`;
   }

   /**
    * Capitalise attribute first letter
    */
   capitaliseFirst(txt){
      return txt.charAt(0).toUpperCase() + txt.substring(1)
   }

}
