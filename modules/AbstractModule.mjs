"use strict";

import Game from './Game.mjs';

/**
 * AbstractModule class
 */
export default class AbstractModule {

   static currentlyOpen = null;

   constructor( game ){
      this.moduleName = this.constructor.name;

      this.game = game;

      // State is used to export & import snapshots
      this.state = {}

      // Is this module currently displaying?
      this.visible = false;
      this.alwaysVisible = false;

      // Status is used as the default render
      this.status = '';

      // Array of functions to call after render
      this.postRenderQueue = [];
   }

   /**
    * Prompt proxy
    */
   prompt( msg ){
      return this.game.prompt( msg );
   }

   /**
    * Y/N prompt
    */
   yesNoPrompt( msg ){
      const input = this.prompt( `${msg} [y/n]` );
      return input.toLowerCase() === 'y';
   }

   /**
    * Number prompt - accepts a second paramater
    * which enables relative inputs e.g. `+1` will
    * return the value n + 1
    */
   numberPrompt( msg = `Please enter a number`, n = null ){

      const input = this.prompt( msg );

      // Empty input cancels
      if( '' === input ) return;

      const relative = [ '-', '+' ].includes( input.charAt(0) );
      const number = parseInt( input );

      if( isNaN( number ) ) { return this.numberPrompt( undefined, n ) }

      if( relative && n !== null ) { return n + number }

      return number;
   }

   /**
    * Set this module to `open`
    */
   open(){

      // Close currently open module
      if( AbstractModule.currentlyOpen ){
         AbstractModule.currentlyOpen.close();
      }

      AbstractModule.currentlyOpen = this;

      this.visible = true;

      return `${ this.getMenuTitle() } menu opened`;
   }

   /**
    * Set this module to not `open`
    */
   close(){
      AbstractModule.currentlyOpen = null;

      if( !this.alwaysVisible ) this.visible = false;

      return `${ this.getMenuTitle() } menu closed`;
   }

   /**
    * Is this menu currently open?
    */
   isOpen(){
      return AbstractModule.currentlyOpen === this;
   }

   /**
    * Return array of title & callback pairs
    */
   menu(){
      if( this.isOpen() ){

         const menu = this.getMenuOpen();

         // Prepend indent to each config item
         for( let i = 1; i < menu.length; i++ ){

            const s = Game.highKeyFormat(
               i < menu.length -1 ? `├─ ` : `└─ `
            );

            menu[i].title = `${ s }${ menu[i].title }`;
         }

         return menu;
      }

      if( AbstractModule.currentlyOpen ) return [];

      return this.getMenuClosed();
   }

   /**
    * Return string to display in view
    */
   render(){
      let output;

      if( this.visible || this.alwaysVisible ){
         output = this.getRender();
      }

      // Execute post-render queue, an array of functions
      // used to clean up changes that only persist for
      // one render
      for( const f of this.postRenderQueue ){
         f();
      }

      this.postRenderQueue = [];

      return output;
   }

   /**
    * Title to be displayed in menu for this module
    */
   getMenuTitle(){
      return this.moduleName;
   }

   /**
    * Get menu config when module menu is closed
    */
   getMenuClosed(){

      // If menu open only has one entry then use that instead
      const menuOpen = this.getMenuOpen();

      if( menuOpen.length === 2 ){
         return [ menuOpen[ 1 ]];
      }

      // For subclasses that have an array of items
      // i.e. Inventory, Snapshots, Notes
      const a = this.state.a;

      const itemCount = a && a.length ?
         ` {${ a.length }}`
         : '';

      return [
         {
            title: `${ this.getMenuTitle() }${ itemCount }…`,
            action: ()=> this.open()
         }
      ]
   }

   /**
    * Get menu config when module menu is open
    *
    * Placeholder methods for subclasses to overwrite
    */
   getMenuOpen(){
      return [
         {
            title: `${ Game.highKeyFormat( this.getMenuTitle() ) } ${ Game.menuIndexFormat( `×` ) }`,
            action: ()=>this.close()
         }
      ]
   }

   /**
    * Get content to display when module active
    *
    * Placeholder methods for subclasses to overwrite
    */
   getRender(){ return this.status }

   /**
    * Helper function to pluck item i from array
    */
   arrayPluck( array, index ) {
      return array.slice( 0, index )
         .concat( array.slice( index + 1 ));
   }
}