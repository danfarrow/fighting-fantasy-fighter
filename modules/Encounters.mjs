"use strict";

import AbstractModule from "./AbstractModule.mjs";
import Character from "./Character.mjs";

/**
 * Encounter class
 */
export default class Encounters extends AbstractModule {
   constructor( game ){
      super( game );
      this.dice = game.dice;
      this.player = game.player;
      this.state.useLuckConfig = null;
      this.state.history = [];
   }

   /**
    * Begin a new encounter
    */
   start(){

      const oName = this.prompt( 'Opponent name' );
      const oSkill = this.numberPrompt( 'Opponent skill' );
      const oStamina = this.numberPrompt( 'Opponent stamina' );

      const o = new Character( this.game, oName );
      o.setAttr( 'skill', oSkill );
      o.setAttr( 'stamina', oStamina );
      const oAttr = o.getAttributesShort();

      // Prepare encounter log object to add to history
      const p = this.player;
      const pName = p.getName();
      const pAttr = p.getAttributesShort();

      this.state.log = {
         title: `${pName} [${pAttr}]\n${oName} [${oAttr}]`,
         roundCount: 0
      }

      this.state.opponent = o;

      return `Encounter with ${oName} started`;
   }

   /**
    * Fight round
    *
    * @todo This is a bit monolithic
    */
   attack(){
      // Increment roundCount in log
      this.state.log.roundCount++;

      const o = this.state.opponent;
      const oName = o.getName();
      const p = this.player;
      const pName = p.getName();

      // Calculate attack strengths (2 dice + skill)
      const roll = this.dice.combatRoll( 2 );
      const playerAS = p.getAttackStrength( roll[0] + roll[1] );
      const opponentAS = o.getAttackStrength( roll[2] + roll[3] );

      // Check for double roll / instant death!
      const instantDeath = roll[0] === roll[1];

      // Damage amount
      const damage = 2;

      const out = [
         `${pName} attack: ${playerAS}`,
         `${oName} attack: ${opponentAS}`
      ];

      const diff = playerAS - opponentAS;

      if( diff < 0 && !instantDeath ){

         // Player was wounded
         out.push( p.damage( damage ));

         // Use luck? Damage = lucky ? 1 : 3
         this.state.useLuckConfig = {
            title: "Use luck to reduce injury",
            lucky: ()=> p.damage( -1 ),
            unlucky: ()=> p.damage( 1 )
         };

         // Player died
         if( !p.isAlive() ){
            return this.end( o, p );
         }

      } else if( diff > 0  || instantDeath ){

         // Opponent was wounded
         out.push( o.damage( instantDeath ? o.getAttr( 'stamina' ) : damage ));

         // Use luck? damage = lucky ? 4 : 1
         this.state.useLuckConfig = {
            title: "Use luck to increase damage",
            lucky: ()=> o.damage( 2 ),
            unlucky: ()=> o.damage( -1 )
         };

         // Opponent died
         if( !o.isAlive() ) {

            // Replace `[opponent] wounded!` message
            out.pop();
            out.push( `You killed ${oName}!` );

            return this.end( p, o, instantDeath );
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
      // Get boolean luck test result
      const lucky = this.player.testLuck(true);
      const ascii = this.player.getLuckAscii(lucky);

      if(lucky) {
         return `${ascii}\n`
            + this.state.useLuckConfig.lucky();
      } else {
         return `${ascii}\n`
            + this.state.useLuckConfig.unlucky();
      }

      this.state.useLuckConfig = null;
   }

   /**
    * Render view
    */
   getRender(){
      const o = this.state.opponent;
      if( !o ) return;

      return o.getFightStatusArr().join( `\n` );
   }

   /**
    * Finish the current encounter & close menu
    */
   end( victor, loser, instantDeath = false ){
      const r = this.state.log.roundCount;
      let msg;

      // Update log
      if( victor ){
         msg = `${ loser.getName() } killed by `
            + `${ victor.getName() } in `
            + `${ r } round${r > 1 ? 's' : ''}`;
      } else {
         msg = `Encounter with `
            + this.state.opponent.getName()
            + ` ended` ;
      }

      // Save log
      this.state.log.outcome = msg;
      this.state.history.push( this.state.log );

      // Reset
      delete this.state.log;
      delete this.state.useLuckConfig;
      delete this.state.opponent;

      // Close
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
      const o = this.state.opponent;
      const out = [];

      out.push(
         o ? {
               title: `Encounter [${o.getName()}]…`,
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

      const p = this.player;
      const canUseLuck = this.player.getAttr( 'luck' ) > 0;
      const o = this.state.opponent;
      const opts = [ ...super.getMenuOpen() ];

      // Menu differs depending on whether an
      // encounter is in progress
      if( !o ){
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
               title: `Attack ${o.getName()}`,
               action: ()=>this.attack()
            }
         )

         if( this.state.useLuckConfig && canUseLuck ){
            opts.push(
               {
                  title: this.state.useLuckConfig.title,
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
         const oppMenu = o.getMenuOpen();
         oppMenu.shift();// HACK Remove [close menu]
         opts.push(...oppMenu);

      }

      return opts;
   }
}