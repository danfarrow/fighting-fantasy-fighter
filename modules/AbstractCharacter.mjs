"use strict";

import AbstractModule from './AbstractModule.mjs';
import Game from './Game.mjs';

/**
 * Character class
 */
export default class AbstractCharacter extends AbstractModule {

   constructor( game, state ){

      super( game );

      this.generate( state );
      this.storeInitialValues();

      // Character info always displays while alive
      this.alwaysVisible = true;

      // Status buffer for transient messages
      this.status = [];

      // Formatting for title, attribute bars, dice ASCII
      this.format = Game.opponentFormat;
      this.headerFormat = Game.opponentHeaderFormat;
   }

   /**
    * Roll new character or use supplied state
    */
   generate( state ){

      if( typeof state === 'object' ){
         this.state = state;
      }

      if( !this.state.attributes ){

         this.state.attributes = {};
         this.setAttr( 'name', this.prompt( `${ this.moduleName } name` ));
         this.setAttr( 'skill', this.numberPrompt( `${ this.moduleName } skill` ));
         this.setAttr( 'stamina', this.numberPrompt( `${ this.moduleName } stamina` ));
      }
   }

   /**
    * Store initial attribute values
    */
   storeInitialValues(){
      // Store initial values of skill, stamina, etc.
      this.state.initialValues = {
         ...this.state.attributes
      }
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
      const n = this.getAttr( 'name' );

      if( this.isAlive() ){
         return n;
      }

      return `×${ Game.strikeFormat( n ) }×`;
   }

   /**
    * Set an attribute value
    *
    * string attr Name of attribute
    * int/string value Type-checked value
    */
   setAttr( attr, value ){
      if( '' === value ) return 'Cancelled';

      attr = attr.toLowerCase();

      if( 'name' !== attr ){

         // Numeric attribute values cannot be negative
         value = Math.max( value, 0 );
      }

      this.state.attributes[ attr ] = value;

      return `Changed ${ this.getAttrCaption( attr ) }`;
   }

   /**
    * Add a new attribute
    */
   addAttr( attr, value ){

      if( this.state.attributes[ attr ] ){
         return 'Attribute already exists';
      }

      return this.setAttr(
         attr,
         value || this.numberPrompt( `Set ${ attr.toLowerCase() }` )
      );
   }

   /**
    * Prompt for input to set attribute value
    */
   getPromptToSetAttr( attr ){

      const caption = `Set ${ this.getAttrCaption( attr ) }`;

      // 'name' should be the only non-numeric attribute
      return 'name' === attr ?
         this.prompt( caption )
         : this.numberPrompt( caption, this.getAttr( attr ));
   }

   /**
    * Return attribute Name [value]
    */
   getAttrCaption( attr, capitalise = false ){

      attr = attr.toLowerCase();

      // Check for attribute in state, whilst respecting zero values
      if( !Object.keys( this.state.attributes ).includes( attr ) ){
         return attr;
      }

      const attrValue = this.state.attributes[ attr ];
      const attrName = capitalise ? this.capitaliseFirst( attr ) : attr;
      return `${ attrName } {${ attrValue }}`;
   }

   /**
    * Title to be displayed in menu for this module
    */
   getMenuTitle(){
      return this.getName();
   }

   /**
    * Populate menu in open state
    */
   getMenuOpen(){

      // Build dynamic menu for setting attribute values
      const menu = [];

      for( const attr in this.state.attributes ) {
         menu.push(
            {
               title: this.getAttrCaption( attr, true ),
               action: ()=> this.setAttr( attr, this.getPromptToSetAttr( attr ))
            }
         );
      }

      // Add 'Add attribute' menu entry
      menu.push(
         {
            title: 'Add attribute',
            action: ()=> this.addAttr( this.prompt( 'Attribute name' ))
         }
      );

      return [
         ...super.getMenuOpen(),
         ...menu
      ]
   }

   /**
    * Return character dashboard text e.g.
    *
    *    Anonymous Player
    *    ⚔ ⚔ ⚔ ⚔ ⚔ ⚔ ⚔ ⚔ ⚔ ⚔ ⚔ [11]
    *    ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ [22]
    *
    */
   getRender(){
      const skill = this.getAttr( 'skill' );
      const skillInit = this.state.initialValues.skill;
      const skillLost = Math.max( skillInit - skill, 0 );

      const skillString =
         this.format( '⚔ '.repeat( skill )) +
         '· '.repeat( skillLost ) +
         `{${ skill }}`;

      const stamina = this.getAttr( 'stamina' );
      const stamInit = this.state.initialValues.stamina;
      const stamLost = Math.max( stamInit - stamina, 0 );

      const staminaString =
         this.format( '♥ '.repeat( stamina )) +
         '♡ '.repeat( stamLost ) +
         `{${ stamina }}`;

      const out = [ this.headerFormat( ` ${ this.getName() } ` ) ];
      out.push( skillString );
      out.push( staminaString );

      // Format & add extra status messages, then reset status
      out.push( ...this.status.map( s => this.format( s )));
      this.status = [];

      // Reset initial formats
      this.format = Game.opponentFormat;
      this.headerFormat = Game.opponentHeaderFormat;

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
    * Return attack strength total (2 dice + skill),
    * isDouble & status update
    */
   getAttackStrength( ){
      const { total, isDouble, ascii } = this.game.dice.roll();
      const skill = this.getAttr( 'skill' );
      const name = this.getName();

      // Show colour formatted dice rolls in status
      this.status.push( ascii );

      // Compose attack status line
      const attackStrength = total + skill;
      const caption = `${ name } attack: ${ attackStrength }`;
      return { total: attackStrength, isDouble, caption };
   }

   /**
    * Take damage. Reduce stamina by `amt`
    */
   damage( amt, opponent = null ){

      const  attribution = opponent ?  `by ${ opponent.getName() }` : ``;
      this.setAttr( 'stamina', this.getAttr( 'stamina' ) - amt );

      // Change output format to show damage
      this.format = Game.characterDamageFormat
      this.headerFormat = Game.characterDamageHeaderFormat;

      if( this.isAlive() ){
         return `${ this.getName() } wounded ${ attribution }`;
      }

      // Character is dead
      return `${ this.getName() } defeated ${ attribution }`;
   }

   /**
    * Remove self from game modules
    */
   onEncounterEnd(){
      this.postRenderQueue.push( ()=> this.game.removeModule( this ));
   }

   /**
    * Heal: increase stamina
    */
   heal( amt ){
      this.setAttr( 'stamina', this.getAttr( 'stamina' ) + amt );
      return `${ this.getName() } healed [${ amt }]!`;
   }

   /**
    * Capitalise attribute first letter
    */
   capitaliseFirst(txt){
      return txt.charAt(0).toUpperCase() + txt.substring(1)
   }

}