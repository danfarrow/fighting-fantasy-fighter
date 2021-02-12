"use strict";

import AbstractModule from "./AbstractModule.mjs";
import Game from "./Game.mjs";

/**
 * Character class
 */
export default class Character extends AbstractModule {
   constructor( game, name, skill, stamina ){
      super( game );

      this.state.attributes = {
         name: name || this.prompt( 'Opponent name' ),
         skill: skill || this.numberPrompt( 'Opponent skill' ),
         stamina: stamina || this.numberPrompt( 'Opponent stamina' )
      };

      // Store initial values of skill, stamina
      this.state.initialValues = {
         skill: this.getAttr( 'skill' ),
         stamina: this.getAttr( 'stamina' )
      }

      // Status buffer for transient messages
      this.status = [];

      // Formatting for title, attribute bars, dice ASCII
      this.format = Game.opponentFormat;
   }

   /**
    * Return the requested attribute
    */
   getAttr( attr ){
      attr = attr.toLowerCase();
      return this.state.attributes[ attr ];
   }

   /**
    * Is this character alive?
    */
   isAlive(){
      return this.getAttr( 'stamina' ) > 0;
   }

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

      return "name" === attr ?
         this.prompt( caption )
         : this.numberPrompt( caption );
   }

   /**
    * Return attribute Name [value]
    */
   getAttrCaption( attr, capitalise = false ){

      attr = attr.toLowerCase();
      if( !this.state.attributes[ attr ] ) return;

      const attrValue = this.state.attributes[attr];
      const attrName = capitalise ? this.capitaliseFirst( attr ) : attr;
      return `${ attrName } ${ Game.lowKeyFormat( `[${ attrValue }]` )}`;
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
      // Add any extra status messages & clear status
      const out = [...this.getFightStatusArr(), ...this.status];
      this.status = [];

      return out.join(`\n`);
   }

   /**
    * Roll 2 dice for this character
    */
   rollDice(){
      const dice = [ this.game.dice.roll(1), this.game.dice.roll(1) ];
      this.status.push( this.game.dice.getAscii( dice, this.diceFormat ));
      return dice.reduce(( t, n ) => t + n );
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
    * Return attack strength (2 dice + skill)
    */
   getAttackStrength( diceRoll ){
      return diceRoll + this.getAttr( 'skill' );
   }

   /**
    * Return array of lines for fight status
    */
   getFightStatusArr(){
      const skill = this.getAttr( 'skill' );
      const stamina = this.getAttr( 'stamina' );
      const staminaInitial = this.state.initialValues.stamina;
      const staminaLost = Math.max( staminaInitial - stamina, 0 );

      const staminaString = this.diceFormat( "♥ ".repeat( stamina ))
         + Game.mCountFormat( "♡ ".repeat( staminaLost ));
      const skillString = this.diceFormat( "⚔ ".repeat( skill ));

      const out = [ `[[${ this.getName() }]]${ skillString }` ];
      out.push( staminaString );

      return out;
   }

   /**
    * Take damage or heal (negative damage)
    */
   damage( amt ){

      this.setAttr(
         'stamina',
         this.getAttr( 'stamina' ) - amt
      );

      if( this.isAlive() ){
         const caption = amt > 0 ?
            ` was wounded [${ amt }]`
            : ` was healed [${ Math.abs( amt ) }]`;

         return `${ this.getName() }${ caption }!`;
      }

      // Character is dead
      return `${ this.getName() } is dead!`
   }

   /**
    * Capitalise attribute first letter
    */
   capitaliseFirst(txt){
      return txt.charAt(0).toUpperCase() + txt.substring(1)
   }

}
