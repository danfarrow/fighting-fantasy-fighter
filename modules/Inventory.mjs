"use strict";

import AbstractCollectionModule from './AbstractCollectionModule.mjs';

/**
 * Inventory manager
 */
export default class Inventory extends AbstractCollectionModule {
   constructor( game ){
      super( game );

      this.allowAddMultiple = true;

      // Custom captions for inventory
      this.captions = {
         ...this.captions,
         addMenu: 'Add items',
         addMenuVerbose: `Add inventory`,
         addPrompt: 'Add item name',
         removeMenu: 'Drop item',
         removeAllMenu: 'Drop all',
         added: '$ added to inventory',
         removed: '$ was dropped'
      }
   }
}