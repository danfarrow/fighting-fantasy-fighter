"use strict";

import AbstractModule from './AbstractModule.mjs';
import Opponent from './Opponent.mjs';

/**
 * Encounter class
 */
export default class Encounters extends AbstractModule {
   constructor( game ){
      super( game );
      this.dice = game.dice;
      this.player = game.player;
      this.useLuckConfig;
      this.alwaysVisible = true;
   }

   getMenuTitle(){ return 'Fight' }

   /**
    * Begin a new encounter
    */
   start(){
      const player = this.player;

      // Create opponent
      const opponent = this.addOpponent();

      // Log entry for start of encounter
      const title =
         `${ player.getName() } [${ player.getAttributesShort() }]\n`
         + `${ opponent.getName() } [${ opponent.getAttributesShort() }]`;

      // Open this module
      this.open();

      return `Fight with ${ opponent.getName() } started!`;
   }

   /**
    * Add opponent
    */
   addOpponent(){

      const opponent = new Opponent( this.game );

      // Register opponent with game
      this.game.registerOpponent( opponent );

      return opponent;
   }

   /**
    * Fight round
    */
   attack( opponent ){

      const player = this.player;

      const otherOpponents = this.game.getOpponents()
         .filter(( i ) => i !== opponent );

      // Get results of attack round
      const { loser, output } = player.attack(
         opponent,
         otherOpponents
      );

      if( loser === player ){

         // Set 'use luck' functions
         this.useLuckConfig = {
            title: 'Use luck to reduce injury',
            opponent: opponent,
            lucky: ()=> this.player.heal( 1 ),
            unlucky: ()=> this.player.damage( 1 )
         };

         // Player died
         if( player.isDead() ){
            this.end( opponent );
            return output.join( `\n` );
         }

      } else if( loser === opponent ){

         // Set 'use luck' functions
         this.useLuckConfig = {
            title: 'Use luck to increase damage',
            opponent: opponent,
            lucky: ()=> opponent.damage( 2 ),
            unlucky: ()=> opponent.heal( 1 )
         };

         // Opponent died
         if( opponent.isDead() ) {
            this.end( opponent );
            return output.join( `\n` );
         }

      } else {

         // Nobody wounded
         output.push( `Miss!` );

      };

      return output.join( `\n` );
   }

   /**
    * Execute damage adjustment function based on luck
    */
   useLuck( opponent ){

      if( !this.useLuckConfig ) return;

      // Copy & delete useLuckConfig
      const luckConfig = this.useLuckConfig;
      this.useLuckConfig = null;

      // Get boolean luck test result
      const lucky = this.player.testLuck( true );
      const output = [];

      if( lucky ) {
         output.push( luckConfig.lucky() );
      } else {
         output.push( luckConfig.unlucky() );
      }

      // Check for player / opponent death
      if( this.player.isDead() || opponent.isDead() ){
         return this.end( opponent );
      }

      return output.join( `\n` );
   }

   /**
    * End the current encounter, close menu, clean up
    */
   end( opponent ){
      this.player.onEncounterEnd( opponent );
      opponent.onEncounterEnd();

      // Close if no more living opponents
      if( 0 === this.game.getOpponentCount() ){
         this.close();
      }
   }

   /**
    * Get menu config when module menu is closed
    */
   getMenuClosed(){

      // If opponents < 2 show default menu
      const oppCount = this.game.getOpponentCount();

      if( oppCount < 2 ){
         return super.getMenuClosed();
      }

      // Show number of current opponents after module name
      const oppCountTxt = ` {${ oppCount }}`;

      return [
         {
            title: `${ this.getMenuTitle() }${ oppCountTxt }…`,
            action: ()=> this.open()
         }
      ]
   }

   /**
    * Get menu config when module menu is open
    */
   getMenuOpen(){

      // If no player luck then delete `this.useLuckConfig`
      if( this.player.getAttr( 'luck' ) < 1 ) {
         this.useLuckConfig = null;
      }

      const menu = [ ...super.getMenuOpen() ];
      const opponents = this.game.getOpponents();

      // Menu differs depending on whether an
      // encounter is in progress
      if( opponents.length === 0 ){
         menu.push(
            {
               title: `Start fight`,
               action: ()=> this.start()
            }
         )

      } else {

         // Encounter in progress. Add `Attack...`
         // for each opponent
         for( const opponent of opponents ){
            menu.push(
               {
                  title: `Attack ${ opponent.getName() }`,
                  action: ()=> this.attack( opponent )
               }
            );
         }

         // Add 'Add opponent'
         menu.push(
            {
               title: `Add opponent`,
               action: ()=> {
                  const opponent = this.addOpponent();
                  return `${ opponent.getName() } added`;
               }
            }
         );

         // Add 'Escape encounter'
         menu.push(
            {
               title: `Escape encounter`,
               action: ()=> {
                  for( const opponent of opponents ){
                     this.end( opponent );
                  }

                  return 'Encounter ended';
               }
            }
         );

         if( this.useLuckConfig ){
            menu.push(
               {
                  title: this.useLuckConfig.title,
                  action: ()=> this.useLuck( this.useLuckConfig.opponent )
               }
            )
         }
      }

      return menu;
   }
}