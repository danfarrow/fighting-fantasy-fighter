"use strict";

// https://www.npmjs.com/package/prompt-sync
import Prompt from 'prompt-sync';
import Game from './Game.mjs';

/**
 * AbstractModule class
 */
export default class AbstractModule {

   static currentlyOpen = null;

   constructor(game){
      this.moduleName = this.constructor.name;
      this.game = game;
      this.indent = game.indent

      // State is used to export & import snapshots
      this.state = {}

      // Prompt is used to get user input
      this.promptObj = new Prompt({ sigint: true });

      // Is this module currently displaying?
      this.visible = false;
      this.alwaysVisible = false;

      // Status is used as the default render
      this.status = '';
   }

   /**
    * Indented prompt
    */
   prompt(msg){
      return this.promptObj(
         Game.promptFormat( this.indent + msg + ` ܀ ` )
      );
   }

   /**
    * Y/N prompt
    */
   yesNoPrompt(msg){
      const input = this.prompt( `${msg} [y/n]` );
      return input.toLowerCase() === 'y';
   }

   /**
    * Set this module to `open`
    */
   open(){
      if( AbstractModule.currentlyOpen ) AbstractModule.currentlyOpen.close();
      AbstractModule.currentlyOpen = this;

      this.visible = true;
      return `${this.moduleName} menu opened`;
   }

   /**
    * Set this module to not `open`
    */
   close(){
      AbstractModule.currentlyOpen = null;

      if( !this.alwaysVisible) this.visible = false;
      return `${this.moduleName} menu closed`;
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

         const menuConfig = this.getMenuOpen();

         // Prepend indent to each config item
         for(let i = 1; i < menuConfig.length; i++){
            const s = Game.dividerFormat(
               i < menuConfig.length -1 ? `├─` : `└─`
            );
            menuConfig[i].title = `${s}${menuConfig[i].title}`;
         }
         return menuConfig;
      }

      if( AbstractModule.currentlyOpen ) return [];

      return this.getMenuClosed();
   }

   /**
    * Return string to display in view
    */
   render(){
      if( this.visible || this.alwaysVisible ){
         return this.getRender();
      }
   }

   /**
    * Get menu config when module menu is closed
    *
    * Placeholder methods for subclasses to overwrite
    */
   getMenuClosed(){
      return [
         {
            title: `${this.moduleName}…`,
            action: ()=>this.open()
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
            title: `${this.moduleName} ${Game.indexFormat(`⊗`)}`,
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
   arrayPluck(array, index) {
      return array.slice(0, index)
         .concat(array.slice(index + 1));
   }
}