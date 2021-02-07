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

   start(){
      // Encounter menu opens when a new encounter starts
      this.open();

      const oName = this.prompt( 'Opponent name' );
      const oSkill = this.prompt( 'Opponent skill' );
      const oStamina = this.prompt( 'Opponent stamina' );

      const o = new Character( this.game, oName );
      o.setAttr( 'skill', oSkill );
      o.setAttr( 'stamina', oStamina );
      const oAttr = o.getAttributesShort();

      // Prepare encounter log object to add to history
      const p = this.player;
      const pName = p.getName();
      const pAttr = p.getAttributesShort();

      this.state.log = {
         title: `${pName}\n[${pAttr}]\n   v.s.  \n${oName}\n[${oAttr}]`,
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
      const o = this.state.opponent;
      const oName = o.getName();
      const p = this.player;

      // Increment roundCount in log
      this.state.log.roundCount++;

      // Calculate attack strengths (2 dice + skill)
      const oAttackStrength = this.dice.roll(2) + o.getAttr('skill');
      const pAttackStrength = this.dice.roll(2) + p.getAttr('skill');

      let damage = 2;
      let instantDeath = false;

      // Check for double roll / instant death!
      if( this.dice.double ){
         instantDeath = true;
         damage = o.getAttr('stamina');
      }

      const diff = pAttackStrength - oAttackStrength;
      const out = [
         `Your attack strength: ${pAttackStrength}`,
         `${oName}’s attack strength: ${oAttackStrength}`
      ];


      if( diff < 0 && !instantDeath ){

         out.push( `You were wounded!` );
         p.setAttr('stamina', p.getAttr('stamina') - damage);

         // Use luck? Damage = lucky ? 1 : 3
         this.state.useLuckConfig = {
            title: "Use luck to reduce injury",
            lucky:()=> {
               p.setAttr('stamina', p.getAttr('stamina') + 1);
               return `\nYour damage was reduced by 1`
            },
            unlucky:()=> {
               p.setAttr('stamina', p.getAttr('stamina') - 1);
               return `\nYour damage was increased by 1`
            }
         };

         // Player died
         if( p.getAttr('stamina') <= 0 ){

            // Update log
            const r = this.state.log.roundCount;
            this.state.log.outcome = `${p.getName()} was killed in ${r} rounds`;

            this.end();
            return( `You were killed by ${oName}!` );
         }

      } else if( diff > 0  || instantDeath ){

         out.push(`${o.getName()} wounded!`);
         o.setAttr('stamina', o.getAttr('stamina') - damage);

         // Use luck? damage = lucky ? 4 : 1
         this.state.useLuckConfig = {
            title: "Use luck to increase damage",
            lucky:()=> {
               o.setAttr('stamina', o.getAttr('stamina') - 2);
               return `\n${o.getName()}’s damage was increased by 2`
            },
            unlucky:()=> {
               o.setAttr('stamina', o.getAttr('stamina') + 1);
               return `\n${o.getName()}’s damage was decreased by 1`
            }
         };

         // Opponent died
         if( o.getAttr('stamina') <= 0 ) {

            // Replace `[opponent] wounded!` message
            out.pop();
            out.push( `You killed ${oName}!` );

            // Add instant death message
            if( instantDeath ){
               out.push( `INSTANT DEATH!` );
            }

            // Update log
            const r = this.state.log.roundCount;
            this.state.log.outcome = `${oName} killed in ${r} rounds`;

            this.end();
         }

      } else {

         out.push(`Miss!`);

      };

      return out.join(`\n`);
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

      const oName = o.getName();
      const oStamina = o.getAttr('stamina');
      const p = this.game.player;
      const pName = p.getName();
      const pStamina = p.getAttr('stamina');
      return `${pName}\n${"♥ ".repeat(pStamina)}\n`
         + `${"♥ ".repeat(oStamina)}\n${oName}`;
   }

   /**
    * Finish the current encounter & close menu
    */
   end(){
      const o = this.state.opponent;
      const msg = `Encounter with ${o.getName()} ended`;

      // Save log
      this.state.history.push(this.state.log);

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


   getMenuClosed(){
      const o = this.state.opponent;
      const out = [];

      out.push(
         o ? {
               title: `Encounter with ${o.getName()}…`,
               action: ()=>this.open()
            }
         :{
            title: `Encounter…`,
            action: ()=>this.start()
         }
      );

      if( this.state.history.length ){
         out.push(
            {
               title: `Encounter history`,
               action: ()=>this.history()
            }
         );
      }

      return out;
   }

   /**
    * Get menu config when module menu is open
    */
   getMenuOpen(){

      const o = this.state.opponent;
      const opts = [];

      if( o ){
         opts.push(
            {
               title: `Attack ${o.getName()}`,
               action: ()=>this.attack()
            }
         )
      }

      if( this.state.useLuckConfig ){
         opts.push(
            {
               title: this.state.useLuckConfig.title,
               action: ()=>this.useLuck()
            }
         )
      }

      if( o ){
         opts.push(
            {
               title: `End encounter`,
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