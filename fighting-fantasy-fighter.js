"use strict";

// Simple prompt inputs
// https://www.npmjs.com/package/prompt-sync
const prompt = require( 'prompt-sync' )({ sigint: true });

// Simple cli colours
// https://www.npmjs.com/package/cli-color
const clc = require( 'cli-color' );

// Define spacers
const spacerStr1 = clc.xterm(243)( `\n==================\n` );
const spacerStr2 = clc.xterm(243)( `\n------------------\n` );
const spacer = () => console.log();
const spacer1 = () => console.log( spacerStr1 );
const spacer2 = () => console.log( spacerStr2 );

// Define heading & caption formatting
const h1Format = clc.cyan.bold;
const h2Format = clc.cyan;
const h3Format = clc.cyan.bold;
const h3BoldFormat = clc.magentaBright.bold;
const format = clc.white;
const captionFormat = clc.bgYellowBright.black;
const captionLowFormat = clc.yellowBright;
const captionBadFormat = clc.bgRedBright.black;
const captionGoodFormat = clc.bgGreenBright.black;
const staminaFormat = clc.redBright;
const staminaWarningFormat = clc.redBright.blink;
const h1 = (str) => console.log( h1Format( str ) );
const h2 = (str) => console.log( h2Format( str ) );
const h3 = (str) => console.log( h3Format( str ) );
const h3Bold = (str) => console.log( h3BoldFormat( str ) );
const h1Prompt = (str, fallback) => prompt( h1Format( `${str} : ` ), fallback );
const h2Prompt = (str, fallback) => prompt( h2Format( `${str} : ` ), fallback );
const h3Prompt = (str, fallback) => prompt( h3BoldFormat( `${str} : ` ), fallback );
const doPrompt = (str, fallback) => prompt( format( `${str} : ` ), fallback );
const caption = (str) => console.log( captionFormat( str ) );
const captionLow = (str) => console.log( captionLowFormat( str ) );
const captionBad = (str) => console.log( captionBadFormat( str ) );
const captionGood = (str) => console.log( captionGoodFormat( str ) );

/**
 * Roll n 6 sided dice
 */
const rollDice = (n = 1) => Math.ceil(Math.random() * ( 6 * n ));

/**
* Test luck
*/
const testLuck = () => {
   if( luck < 1 ) return false;
   const lucky = rollDice( 2 ) <= luck--;
   spacer2();
   lucky ? captionGood( 'Lucky!') : captionBad( 'Unlucky!' );
   return lucky;
}

/**
 * Report stamina with conditional warning
 */
const reportStamina = ( st ) => {
   const format = st > 2 ? staminaFormat : staminaWarningFormat;
   console.log( format( "♥ ".repeat(st) ) );
}
/**
 * Display player attributes
 */
const showAttributes = ( n = name, sk = skill, st = stamina, lk = luck ) => {
   h1( `${n} [ Skill ${sk}${ lk ? ` Luck ${lk}` : ``} ]` );
   reportStamina( st );
}

/**
 * Run a battle between the player & the supplied monster stats
 */
const battle = ( mName, mSkill, mStamina ) => {

   h1( 'BATTLE!' );

   let round = 0;

   while( true ){

      // Show round captions
      spacer2();
      showAttributes();

      spacer();
      showAttributes( mName, mSkill, mStamina, null );

      spacer1();
      h1( `ROUND ${++round}` );
      spacer1();

      // Calculate attack strengths
      const attackStrength = rollDice(2) + skill,
         mAttackStrength = rollDice(2) + mSkill,
         diff = attackStrength - mAttackStrength;

      const esc = h3Prompt( `Fight [ENTER] or Escape [E]` );
      spacer2();

      if( "e" === esc.toLowerCase() ){
         caption( `You escaped!` );
         return;
      }

      if( diff === 0 ){
         caption( `Miss! 💫` );
         continue;
      }

      if( diff < 0 ){

         // Monster wins!
         captionBad( `You were wounded!` );
         spacer();

         let damage = 2;

         if( luck > 0 ){
            h3( `Test luck (${luck}) to reduce injury?` );
            const luckInput = h3Prompt( `Yes [y] or No [ENTER]` );
            if( "y" === luckInput.toLowerCase() ) damage = testLuck() ? 1 : 3;
         }

         stamina -= damage;

         if( stamina < 1 ){
            spacer1();
            captionBad( `${mName} killed you! YOUR ADVENTURE ENDS HERE 💀` );
            spacer1();
            process.exit();
         }

      } else {

         // Player wins!
         captionGood( `${mName} was wounded!` );
         spacer();

         let damage = 2;

         if( luck > 0 ){
            h3( `Test luck (${luck}) to reduce injury?` );
            const luckInput = h3Prompt( `Yes [y] or No [ENTER]` );
            if( "y" === luckInput.toLowerCase() ) damage = testLuck() ? 4 : 1;
         }

         mStamina -= damage;

         if( mStamina < 1 ){
            spacer1();
            captionGood( `${mName} is dead! YOU LIVE 😎` );
            spacer();
            return;
         }
      }
   }
}

// Intro sequence
spacer();
const name = h3Prompt( `What is your name adventurer?`, `Anonymous` );
spacer1();
h1( `Greetings brave ${name}!` );
spacer();
h2( `Input your attributes or [ENTER] to randomise` );
spacer();

let skill = parseInt( h3Prompt( `Skill (1 die + 6)`, rollDice() + 6 ) );
captionLow( skill );
spacer();

let stamina = parseInt( h3Prompt( `Stamina (2 dice + 12)`, rollDice(2) + 12 ) );
captionLow( stamina );
spacer();

let luck = parseInt( h3Prompt( `Luck (1 dice + 6)`, rollDice() + 6 ) );
captionLow( luck );

spacer();
h1( `You are ready to begin your adventure!` );
spacer1();

// Monster encounters loop
while( true ){

   const esc = h3Prompt( `Continue [ENTER] or quit [Q]` );

   if( "q" === esc.toLowerCase() ) {
      spacer(), caption( `Goodbye!` ), spacer();
      process.exit();
   }

   spacer2(), caption( `A monster is approaching!` ), spacer();
   captionLow( `Input monster attributes or [ENTER] to randomise` );
   spacer();

   const mName = h3Prompt( `Monster name`, 'Unknown monster' );
   captionLow( mName );
   spacer();

   const mSkill = parseInt( h3Prompt( `Monster skill`, rollDice() + 6 ) );
   captionLow( mSkill );
   spacer();

   const mStamina = parseInt( h3Prompt( `Monster stamina` , rollDice(2) + 12 ) );
   captionLow( mStamina );
   spacer2();

   // Fight!
   battle( mName, mSkill, mStamina );
}