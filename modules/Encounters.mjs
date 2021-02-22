"use strict";

import AbstractModule from "./AbstractModule.mjs";
import Character from './Character.mjs';

/**
 * Encounter class
 */
export default class Encounters extends AbstractModule {
   constructor( game ){
      super( game );
      this.dice = game.dice;
      this.player = game.player;
      this.useLuckConfig;
      //this.state.history = [];
      this.alwaysVisible = true;
   }

   getMenuTitle(){ return 'Fight' }

   /**
    * Begin a new encounter
    */
   start(){
      const player = this.player;

      // Create opponent
      // @todo This func should be removed from Player
      const opponent = this.addOpponent();
      const opponentName = opponent.getName();

      // Log entry for start of encounter
      const title =
         `${ player.getName() } [${ player.getAttributesShort() }]\n`
         + `${ opponentName } [${ opponent.getAttributesShort() }]`;

      // this.state.log = {
      //    title: title,
      //    roundCount: 0
      // }

      return `Fight with ${ opponentName } started!`;
   }

   /**
    * Add opponent
    */
   addOpponent(){

      const opponent = new Character( this.game );

      // Register opponent with game
      this.game.registerOpponent( opponent );

      return opponent;
   }

   /**
    * Fight round
    */
   attack( opponent ){

      // Increment roundCount in log
 //     this.state.log.roundCount++;

      const player = this.player;
      const playerName = player.getName();
      const opponentName = opponent.getName();

      // @todo Calculate other opponents attacks
      const otherOpponents = this.game.getOpponents()
         .filter(( i ) => i !== opponent );

      // Get results of attack round
      const {
         playerAttack,
         opponentAttack,
         loser,
         output
      } = player.attack( opponent, otherOpponents );

      if( loser === player ){

         // Set 'use luck' functions
         // @todo Move to player
         this.useLuckConfig = {
            title: 'Use luck to reduce injury',
            opponent: opponent,
            lucky: ()=> this.player.heal( 1 ),
            unlucky: ()=> this.player.damage( 1 )
         };

         // Player died
         if( player.isDead() ){
            // Remove `injured` message
            output.pop();
            return `${ output.join( `\n` ) }\n${ this.lose( opponent ) }`;
         }

      } else if( loser === opponent ){

         // Set 'use luck' functions
         // @todo Move to player
         this.useLuckConfig = {
            title: "Use luck to increase damage",
            opponent: opponent,
            lucky: ()=> opponent.damage( 2 ),
            unlucky: ()=> opponent.heal( 1 )
         };

         // Opponent died
         if( opponent.isDead() ) {
            // Remove `injured` message
            output.pop();
            return `${ output.join( `\n` ) }\n${ this.win( opponent ) }`;
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
      // @todo Use `delete`?
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

      // @todo Check for player / opponent death
      if( this.player.isDead() ){
         return this.lose( opponent );
      }

      if( opponent.isDead() ){
         return this.win( opponent );
      }

      return output.join( `\n` );
   }

   /**
    * Player escaped the encounter
    */
   escape( opponent ){
      const outcome = `Escaped from ${ opponent.getName() }`
      return this.end( opponent, outcome );
   }

   /**
    * Player won the encounter
    */
   win( opponent ){
      // const r = this.state.log.roundCount;
      const outcome =
         `${ opponent.getName() } killed`;

         // in ` +
         // `${ r } round${ r > 1 ? 's' : '' }`;

      return this.end( opponent, outcome );
   }

   /**
    * Player lost the encounter
    */
   lose( opponent ){
      // const r = this.state.log.roundCount;
      const outcome =
         `${ this.player.getName() } killed`;

         //  in ` +
         // `${ r } round${ r > 1 ? 's' : '' }`;

      return this.end( opponent, outcome );
   }

   /**
    * End the current encounter, close menu, clean up
    */
   end( opponent, outcome ){

      this.player.onEncounterEnd( opponent );
      opponent.onEncounterEnd();

      // Update log
    //  this.state.log.outcome = outcome;
    //  this.state.history.push( this.state.log );

      // Reset all state except history
    //  this.state = { history: this.state.history }
      this.state = {};
      this.close();

      return outcome;
   }

   /**
    * Return string of encounter history
    */
   history(){
      // index, title, outcome
      const out = [];

      for( const encounter of this.state.history ){
         out.push( `${ encounter.title }\n${ encounter.outcome }` );
      }

      return out.join( `\n\n` );
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

         // If there is an encounter history
         // add `Encounter history` menu item
         // if( this.state.history.length ){
         //    menu.push(
         //       {
         //          title: `Fight history`,
         //          action: ()=> this.history()
         //       }
         //    );
         // }

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

         // Add `End encounter` & `Use luck...`
         menu.push(
            {
               title: `Add opponent`,
               action: ()=> {
                  const opponent = this.addOpponent();
                  return `${ opponent.getName() } added`;
               }
            },
            // {
            //    title: `Escape fight`,
            //    action: ()=>this.escape( opponent )
            // }
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