"use strict";

import AbstractModule from "./AbstractModule.mjs";
import Character from "./Character.mjs";
import Game from "./Game.mjs";

/**
 * Encounter class
 */
export default class Encounters extends AbstractModule {
   constructor( game ){
      super( game );
      this.dice = game.dice;
      this.player = game.player;
      this.opponent;
      this.useLuckConfig;
      this.state.history = [];
      this.alwaysVisible = true;
   }

   /**
    * Begin a new encounter
    */
   start(){
      const player = this.player;

      // Create opponent
      const opponent = this.addOpponent();
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
    * Create new opponent
    */
   addOpponent(){
      this.opponent = new Character( this.game );

      // Store reference to opponent state in local state
      this.state.opponentState = this.opponent.state;

      return this.opponent;
   }

   /**
    * Restore opponent from stored state
    */
   restoreOpponent(){

      if( !this.state.opponentState ) return;

      // Instantiate opponent with copy of stored state
      const opponent = new Character(
         this.game,
         this.state.opponentState.attributes.name,
         this.state.opponentState.attributes.skill,
         this.state.opponentState.attributes.stamina
      );
      // opponent.state = {...this.state.opponentState };

      // Now overwrite local state with opponent's state obj
      this.state.opponentState = {...opponent.state};
      return opponent;
   }

   /**
    * Return opponent or instantiate from this.state
    */
   getOpponent(){
      if( !this.opponent ){

         // Attempt to restore from stored state
         const opponent = this.restoreOpponent();
         if( !opponent ) return;

         this.opponent = opponent;
      }

      return this.opponent;
   }

   /**
    * Fight round
    *
    * @todo Still quite monolithic
    */
   attack(){
      // Increment roundCount in log
      this.state.log.roundCount++;

      const player = this.player;
      const playerName = player.getName();
      const opponent = this.getOpponent();
      const opponentName = opponent.getName();

      // Roll 2 dice per participant
      // @todo Check for instant death

      // Get attack strengths
      // @todo Move this into player object
      //     so player can check for instant death
      const playerAS = player.getAttackStrength( player.rollDice() );
      const opponentAS = opponent.getAttackStrength( opponent.rollDice() );

      // Damage amount
      const damage = 2;

      // Add attacks to output
      const out = [
         `${ playerName } attack: ${ playerAS }`,
         `${ opponentName } attack: ${ opponentAS }`
      ];

      if( playerAS < opponentAS ){

         // Player was wounded
         out.push( player.damage( damage ));

         // Set 'use luck' functions
         this.useLuckConfig = {
            title: 'Use luck to reduce injury',
            lucky: ()=> player.damage( -1 ),
            unlucky: ()=> player.damage( 1 )
         };

         // Player died
         if( !player.isAlive() ){
            return this.end( opponent, player );
         }

      } else if( playerAS > opponentAS ){

         // Opponent was wounded
         // Instant Death removes all stamina
         out.push( opponent.damage( damage ) );

         // Set 'use luck' functions
         this.useLuckConfig = {
            title: "Use luck to increase damage",
            lucky: ()=> opponent.damage( 2 ),
            unlucky: ()=> opponent.damage( -1 )
         };

         // Opponent died
         if( !opponent.isAlive() ) {
            return this.end( player, opponent );
         }

      } else {

         // Nobody wounded
         out.push( `Miss!` );

      };

      return out.join( `\n` );
   }

   /**
    * Execute damage adjustment function based on luck
    */
   useLuck(){

      if( !this.useLuckConfig ) return;

      // Copy luck config
      const luckConfig = this.useLuckConfig;
      this.useLuckConfig = null;

      // Get boolean luck test result
      const lucky = this.player.testLuck(true);
      const ascii = this.player.getLuckAscii(lucky);

      if(lucky) {
         return `${ascii}\n`
            + luckConfig.lucky();
      } else {
         return `${ascii}\n`
            + luckConfig.unlucky();
      }

   }

   /**
    * Render view
    */
   getRender(){
      const opponent = this.getOpponent();
      if( !opponent ) return;
      return opponent.getRender();
   }

   /**
    * Finish the current encounter & close menu
    */
   end( victor, loser ){
      const r = this.state.log.roundCount;
      const opponent = this.getOpponent();
      let msg;

      // Update log
      if( victor ){
         msg = `${ loser.getName() } killed by `
            + `${ victor.getName() } in `
            + `${ r } round${r > 1 ? 's' : ''}`;
      } else {
         msg = `Encounter with `
            + opponent.getName()
            + ` ended` ;
      }

      // Save log
      this.state.log.outcome = msg;
      this.state.history.push( this.state.log );

      // Reset all state except history
      this.state = { history: this.state.history }
      delete this.opponent;

      this.close();
      return msg;

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
    * If an encounter is in progress
    * show opponent name in menu
    */
   getMenuClosed(){
      const opponent = this.getOpponent();
      const out = [];

      out.push(
         opponent ? {
               title: `Encounter ${ Game.mCountFormat( `[${ opponent.getName() }]` ) }…`,
               action: ()=>this.open()
            }
         :{
            title: `Encounter…`,
            action: ()=>this.open()
         }
      );

      return out;
   }

   /**
    * Get menu config when module menu is open
    */
   getMenuOpen(){

      const canUseLuck = this.player.getAttr( 'luck' ) > 0;
      const opponent = this.getOpponent();
      const opts = [ ...super.getMenuOpen() ];

      // Menu differs depending on whether an
      // encounter is in progress
      if( !opponent ){
         opts.push(
            {
               title: `Start encounter`,
               action: ()=>this.start()
            }
         )

         // If there is an encounter history
         // add `Encounter history` menu item
         if( this.state.history.length ){
            opts.push(
               {
                  title: `Encounter history`,
                  action: ()=>this.history()
               }
            );
         }

      } else {
         // An encounter is in progress - add `Attack...`,
         // `Use luck` (if available), `End encounter`
         // & opponent attribute menu items
         opts.push(
            {
               title: `Attack ${ opponent.getName() }`,
               action: ()=>this.attack()
            }
         )

         if( this.useLuckConfig && canUseLuck ){
            opts.push(
               {
                  title: this.useLuckConfig.title,
                  action: ()=>this.useLuck()
               }
            )
         }

         opts.push(
            {
               title: `Escape encounter`,
               action: ()=>this.end()
            }
         );

         // Add opponent character menu
         const oppMenu = opponent.getMenuOpen();
         oppMenu.shift();// HACK Remove [close menu]
         opts.push(...oppMenu);

      }

      return opts;
   }
}