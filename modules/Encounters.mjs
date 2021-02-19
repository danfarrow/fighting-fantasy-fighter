"use strict";

import AbstractModule from "./AbstractModule.mjs";

/**
 * Encounter class
 */
export default class Encounters extends AbstractModule {
   constructor( game ){
      super( game );
      this.dice = game.dice;
      this.player = game.player;
      this.useLuckConfig;
      this.state.history = [];
      this.alwaysVisible = true;
   }

   getMenuTitle(){
      return 'Encounter';
   }

   /**
    * Begin a new encounter
    */
   start(){
      const player = this.player;

      // Create opponent
      const opponent = this.player.addOpponent();
      const opponentName = opponent.getName();

      // Log entry for start of encounter
      const title =
         `${ player.getName() } [${ player.getAttributesShort() }]\n`
         + `${ opponentName } [${ opponent.getAttributesShort() }]`;

      this.state.log = {
         title: title,
         roundCount: 0
      }

      return `Fight with ${ opponentName } started!`;
   }

   /**
    * Fight round
    */
   attack( opponent ){

      // Increment roundCount in log
      this.state.log.roundCount++;

      const player = this.player;
      const playerName = player.getName();
      const opponentName = opponent.getName();

      const {
         playerAttack,
         opponentAttack,
         loser,
         output
      } = player.attack( opponent );

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
            // Remove `injured` message
            output.pop();
            return `${ output.join( `\n` ) }\n${ this.lose( opponent ) }`;
         }

      } else if( loser === opponent ){

         // Set 'use luck' functions
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
      const r = this.state.log.roundCount;
      const outcome =
         `${ opponent.getName() } killed in ` +
         `${ r } round${ r > 1 ? 's' : '' }`;

      return this.end( opponent, outcome );
   }

   /**
    * Player lost the encounter
    */
   lose( opponent ){
      const r = this.state.log.roundCount;
      const outcome =
         `${ this.player.getName() } killed in ` +
         `${ r } round${ r > 1 ? 's' : '' }`;

      return this.end( opponent, outcome );
   }

   /**
    * End the current encounter, close menu, clean up
    */
   end( opponent, outcome ){

      this.player.onEncounterEnd( opponent );
      opponent.onEncounterEnd();

      // Update log
      this.state.log.outcome = outcome;
      this.state.history.push( this.state.log );

      // Reset all state except history
      this.state = { history: this.state.history }

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
         out.push( `${encounter.title}\n${encounter.outcome}` );
      }

      return out.join( `\n\n` );
   }

   /**
    * Get menu config when module menu is open
    */
   getMenuOpen(){

      // If no player luck then delete `this.useLuckConfig`
      if( this.player.getAttr( 'luck' ) < 1 ) {
         this.useLuckConfig = null;
      }

      const opponent = this.player.getOpponent();
      const menu = [ ...super.getMenuOpen() ];


      // Menu differs depending on whether an
      // encounter is in progress
      // @todo opponent.isDead check shoudn't be needed
      if( !opponent || opponent.isDead() ){
         menu.push(
            {
               title: `Start encounter`,
               action: ()=> this.start()
            }
         )

         // If there is an encounter history
         // add `Encounter history` menu item
         if( this.state.history.length ){
            menu.push(
               {
                  title: `Encounter history`,
                  action: ()=> this.history()
               }
            );
         }

      } else {

         // Encounter in progress. Add `Attack...`, `End encounter`,
         // `Use luck to reduce/increase damage` (if available)
         // & opponent attribute menu items
         menu.push(
            {
               title: `Attack ${ opponent.getName() }`,
               action: ()=> this.attack( opponent )
            },
            {
               title: `Add opponent`,
               action: ()=> this.player.addOpponent()
            },
            {
               title: `Escape encounter`,
               action: ()=>this.escape( opponent )
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