"use strict";

import AbstractModule from "./AbstractModule.mjs";
import Game from "./Game.mjs";

/**
 * Character class
 */
export default class Character extends AbstractModule {
   constructor( game, name, skill, stamina ){
      super( game );

      // Fix circular reference error when
      // stringifying Character instances
      delete this.game;

      this.state.attributes = {
         name: name||"Anonymous character",
         skill: 0,
         stamina: 0
      };
   }

   /**
    * Return the requested attribute
    */
   getAttr(attr){
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
    * Return name prepended with [DEAD] if dead
    */
   getName(){
      const note = this.isAlive() ? '' : '[DEAD] ';
      return note + this.getAttr( 'name' );
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
      if( !this.state.attributes[attr] ) return;

      const attrValue = this.state.attributes[attr];
      const attrName = capitalise ? this.capitaliseFirst( attr ) : attr;
      return `${ attrName } ${ Game.mCountFormat( `[${ attrValue }]` )}`;
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
      const out = [];

      // Display attributes in full format:
      // Skill: 10
      // Stamina: 19
      // etc.
      for(let attr in this.state.attributes){
         out.push(
            `${this.capitaliseFirst(attr)}: ${this.state.attributes[attr]}`
         );
      };

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
    * Return attack strength (2 dice + skill)
    */
   getAttackStrength( diceRoll ){
      return diceRoll + this.getAttr( 'skill' );
   }

   /**
    * Return short status text
    */
   getFightStatus(){
      return this.getFightStatusArr().join( `\n` );
   }

   /**
    * Return array of lines for fight status
    */
   getFightStatusArr(){
      const skillString = "⚔ ".repeat( this.getAttr( 'skill' ));
      const staminaString = "♥ ".repeat( this.getAttr( 'stamina' ));

      const out = [ `[[${ this.getName() }]]${ skillString}` ];
      out.push( staminaString );

      return out;
   }

   /**
    * Take damage
    */
   damage(amt){

      this.setAttr(
         'stamina',
         this.getAttr( 'stamina' ) - amt
      );

      // @todo Handle message for negative amt
      if( this.isAlive() ){
         return `${ this.getName() } was ${ amt > 0 ? 'wounded' : 'healed' }!`;
      }

      // Check for death
      return `${ this.getName() } is dead!`

   }

   /**
    * Capitalise attribute first letter
    */
   capitaliseFirst(txt){
      return txt.charAt(0).toUpperCase() + txt.substring(1)
   }

}
