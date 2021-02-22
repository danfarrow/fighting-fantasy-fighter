"use strict";

import AbstractCollectionModule from './AbstractCollectionModule.mjs';

/**
 * Notes manager
 */
export default class Notes extends AbstractCollectionModule {
   constructor( game ){
      super( game );

      // Custom captions for notes
      this.captions = {
         ...this.captions,
         addMenu: 'Add note',
         addMenuVerbose: `Add note`,
         removeMenu: 'Remove note',
         removeAllMenu: 'Remove all notes',
         addPrompt: 'Add note',
         removePrompt: 'Remove note #',
         notFound: 'Note #$ not found',
         added: `Note '$' was added`,
         removed: `Note '$' was removed`,
         removeAll: 'All notes removed'
      }
   }
}