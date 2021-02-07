"use strict";

import AbstractModule from "./AbstractModule.mjs";

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
      return this.state.attributes[attr];
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
      const note = this.isAlive() ? "" : "[DEAD]";
      return note + this.getAttr( 'name' );
   }

   /**
    * Set an attribute value
    */
   setAttr(attr, value){

      // Convert to integer (except name)
      if( "name" !== attr ) {
         value = parseInt(value);
         if( isNaN(value) ) return "Please enter a number";
      }

      this.state.attributes[attr] = value;
      return `${ this.capitaliseFirst(attr) } set to ${ value }`;
   }

   /**
    * Menu callback to prompt & set attribute value
    */
   setAttrPrompt(attr){
      const oldValue = this.state.attributes[attr];
      let value = this.prompt( `Set ${ attr } [${ oldValue }]`);
      return this.setAttr(attr, value);
   }

   getMenuOpen(){
      // Build dynamic menu to set stats values
      const menu = [];
      for( const attr in this.state.attributes ) {
         menu.push(
            {
               title: `Change ${attr}`,
               action: ()=> this.setAttrPrompt(attr)
            }
         );
      }

      return [
         ...super.getMenuOpen(),
         ...menu
      ]
   }

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

   getRenderShort(){

      return `[[${this.getName()}]]\n`
         + this.getAttributesShort();
   }

   /**
    * Return string of attributes in truncated format:
    * e.g. Sk:99 ╱ St:99 ╱ ...
    */
   getAttributesShort(){
      const out = [];

      for(let attr in this.state.attributes){

         // Skip name attribute
         if( "name" == attr ) continue;

         out.push(
            `${
               this.capitaliseFirst(attr).slice(0,2)
            }:${
               this.state.attributes[attr]
            }`
         );
      };

      return out.join(` ╱ `);
   }

   /**
    * Capitalise attribute first letter
    */
   capitaliseFirst(txt){
      return txt.charAt(0).toUpperCase() + txt.substring(1)
   }

}
