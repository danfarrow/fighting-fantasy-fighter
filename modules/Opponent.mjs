"use strict";

import AbstractCharacter from './AbstractCharacter.mjs';
import Game from './Game.mjs';

/**
 * Opponent class
 */
export default class Opponent extends AbstractCharacter {
   constructor( game, state ){
      super( game, state );
   }
}