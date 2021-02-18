"use strict";

// https://www.npmjs.com/package/prompt-sync
import Prompt from 'prompt-sync';
import clc from 'cli-color';
import fs from 'fs';

const filename = 'decoder-log.txt';
const filepath = `./${ filename }`;
const prompt = new Prompt({ sigint: true });
const log = [];

/**
 * Decode the message
 */
function decode( inputStr ){

//   inputStr = "Jih bvf ebffnebwbk fnf defrp mom yoslvm bfr! Whpocbllsa p not hfevb ppv rupfot pngv fs. T hf";

   const substitute = {
      B: 'A',
      F: 'E',
      J: 'I',
      P: 'O',
      V: 'U',
      b: 'a',
      f: 'e',
      j: 'i',
      p: 'o',
      v: 'u'
   }

   const vowels = [ 'a','e','i','o','u' ];
   const punctuation = [ '.', ',', '!', '?' ];

   const input = inputStr.split( '' );
   const output = [];

   let lastVowel;

   // Loop through characters of message
   for( let i = 0; i < input.length; i++ ){
      const char = input[ i ];

      // Remove spaces
      if( ' ' === char ) continue;

      // Reinstate substituted vowel characters
      if( Object.keys( substitute ).includes( char ) ){
         output.push( substitute[ char ] );
         lastVowel = substitute[ char ].toLowerCase();
         continue;
      }

      // Replace vowels with spaces
      if( lastVowel === char.toLowerCase() ){
         output.push( ' ' );
         continue;
      }

      output.push( char );

      // Add a space after punctuation
      if( punctuation.includes( char ) ){
         output.push( ' ' );
      }
   }

   const outputStr = output.join('');

   // @todo Some vowel substitutions may have been
   // incorrectly substituted. Split message into
   // words and search in /usr/share/dict/words
   // using regexp to correct

   log.push( `${ inputStr }\n\n${ outputStr }\n---------------` );

   return outputStr;
}

/**
 * App init
 */
function init(){
   importLog();
   inputLoop();
}

/**
 * Message decoder loop
 */
function inputLoop(){
   while( true ){

      // Clear screen
      process.stdout.write(clc.reset);

      console.log( getLogString() );

      const input = prompt( 'Msg or Ⓠ ܀ ' );

      // `q` to quit
      if( 'q' === input.trim().toLowerCase() ){
         quit();
      }

      const output = decode( input );
   }
}

/**
 * Return the log array as a string
 */
function getLogString(){
   return log.join( `\n` );
}

/**
 * Import log file from disk
 */
function importLog(){
   if ( fs.existsSync( filepath )) {
      const txt = fs.readFileSync( filepath, 'utf8' );
      const arr = txt.split( `\n` );
      log.push( ...arr );
   }
}

/**
 * Export log file to disk
 */
function exportLog(){
   fs.writeFileSync( `./${ filename }`, getLogString(), 'utf8' );
   console.log( `\nDecode log saved as ${ filename }\n` );
}

/**
 * Save log & close the app
 */
function quit(){
   exportLog();
   process.exit();
}

init();