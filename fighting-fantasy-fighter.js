"use strict";

// Simple prompt inputs
// https://www.npmjs.com/package/prompt-sync
const prompt = require( 'prompt-sync' )({ sigint: true });

// Simple cli colours
// https://www.npmjs.com/package/cli-color
const clc = require( 'cli-color' );

// Define spacers
const spacerStr = clc.xterm(243)( `\n.｡:+*ﾟﾟ*+:｡.｡:+*ﾟﾟ*+:｡.｡.｡:+*ﾟﾟ*+:｡.\n` );
const blankLine = () => console.log();
const spacer = () => console.log( spacerStr );

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
const monsterStaminaFormat = clc.greenBright;
const monsterStaminaWarningFormat = clc.greenBright.blink;
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
const clearScreen = () => process.stdout.write(clc.reset);
const continueOrQuit = () => {
   const esc = h3Prompt( `Continue [ENTER] or quit [q]` );

   if( "q" === esc.toLowerCase() ) {
      clearScreen(), caption( `Goodbye!` ), blankLine();
      process.exit();
   }
};
const replaceLine = () => {
   process.stdout.write(clc.move.up(1));
   process.stdout.write(clc.erase.line);
}
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
   lucky ? captionGood( 'Lucky!') : captionBad( 'Unlucky!' );
   return lucky;
}

/**
 * Report stamina with conditional warning
 */
const reportStamina = ( st, isMonster = false ) => {
   let format;

   if( isMonster ){
      format = st > 2 ? monsterStaminaFormat : monsterStaminaWarningFormat;
   } else {
      format = st > 2 ? staminaFormat : staminaWarningFormat;
   }

   console.log( format( "♥ ".repeat(st) ) );
}
/**
 * Display player attributes
 */
const showAttributes = ( n = name, sk = skill, st = stamina, lk = luck, isMonster = false ) => {
   reportStamina( st, isMonster );
   h2( `${n} [ Skill ${sk}${ lk ? ` Luck ${lk}` : ``} ]` );
}

/**
 * Run a battle between the player & the supplied monster stats
 */
const battle = ( mName, mSkill, mStamina ) => {

   let round = 0;

   while( true ){

      // Show round captions
      clearScreen();

      caption( `FIGHT!` );
      blankLine();

      h1( `Round ${++round}`);
      spacer();

      showAttributes();

      blankLine();
      showAttributes( mName, mSkill, mStamina, null, true );

      blankLine();

      // Continue fight or escape
      const esc = h3Prompt( `Fight [ENTER] or Escape [E]` );

      replaceLine();

      // Calculate attack strengths
      const attackStrength = rollDice(2) + skill,
         mAttackStrength = rollDice(2) + mSkill,
         diff = attackStrength - mAttackStrength;

      if( "e" === esc.toLowerCase() ){
         caption( `You escaped!` );
         blankLine();
         return;
      }

      if( diff === 0 ){
         caption( `Miss! 💫` );
         continue;
      }

      if( diff < 0 ){

         // Monster wins!
         captionBad( `You were wounded!` );
         blankLine();

         let damage = 2;

         if( luck > 0 ){
            h3( `Test luck (${luck}) to reduce injury?` );
            blankLine();
            const luckInput = h3Prompt( `Yes [y] or No [ENTER]` );
            if( "y" === luckInput.toLowerCase() ){
               replaceLine();
               damage = testLuck() ? 1 : 3;
               blankLine();
               continueOrQuit();
            }
         }

         stamina -= damage;

         if( stamina < 1 ){
            spacer();
            captionBad( `${mName} killed you! YOUR ADVENTURE ENDS HERE 💀` );
            process.exit();
         }

      } else {

         // Player wins!
         captionGood( `${mName} was wounded!` );
         blankLine();

         let damage = 2;

         if( luck > 0 ){
            h3( `Test luck (${luck}) to increase damage?` );
            blankLine();
            const luckInput = h3Prompt( `Yes [y] or No [ENTER]` );
            if( "y" === luckInput.toLowerCase() ){
               replaceLine();
               damage = testLuck() ? 4 : 1;
               blankLine();
               continueOrQuit();
            }
         }

         mStamina -= damage;

         if( mStamina < 1 ){
            spacer();
            captionGood( `${mName} is dead! YOU LIVE 😎` );
            blankLine();
            return;
         }
      }
   }
}

// Intro sequence
clearScreen();
const name = h3Prompt( `What is your name adventurer?`, `Anonymous` );
spacer();

h1( `Greetings brave ${name}!` );
blankLine();

h2( `Input your attributes or [ENTER] to randomise` );
blankLine();

let skill = parseInt( h3Prompt( `Skill (1 die + 6)`, rollDice() + 6 ) );
captionLow( skill );
blankLine();

let stamina = parseInt( h3Prompt( `Stamina (2 dice + 12)`, rollDice(2) + 12 ) );
captionLow( stamina );
blankLine();

let luck = parseInt( h3Prompt( `Luck (1 dice + 6)`, rollDice() + 6 ) );
captionLow( luck );

spacer();
h1( `You are ready to begin your adventure!` );
blankLine();

// Monster encounters loop
while( true ){

   continueOrQuit();

   clearScreen();

   caption( `A monster is approaching!` ), spacer();
   captionLow( `Input monster attributes or [ENTER] to randomise` );
   blankLine();

   const mName = h3Prompt( `Monster name`, 'Unknown monster' );
   captionLow( mName );
   blankLine();

   const mSkill = parseInt( h3Prompt( `Monster skill`, rollDice() + 6 ) );
   captionLow( mSkill );
   blankLine();

   const mStamina = parseInt( h3Prompt( `Monster stamina` , rollDice(2) + 12 ) );
   captionLow( mStamina );
   spacer();

   continueOrQuit();

   // Fight!
   battle( mName, mSkill, mStamina );
}