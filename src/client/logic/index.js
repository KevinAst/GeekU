'use strict';

import { createLogic } from 'redux-logic';

import communicateUnexpectedError from './communicateUnexpectedError';
import initializeSelCritEdit      from './initializeSelCritEdit';
import logDispatchedActions       from './logDispatchedActions';
import saveAndUseSelCritEdits     from './saveAndUseSelCritEdits';
import saveSelCrit                from './saveSelCrit';
import syncViewWhenSelCritChanged from './syncViewWhenSelCritChanged';
import useSelCritEdits            from './useSelCritEdits';
import validateSelCritEdits       from './validateSelCritEdits';


//***
//*** accumulation of all app logic
//***

export default [
  // general handler of unexpected errors (within the dispatch process) ...
  communicateUnexpectedError,

  // general utility that logs all dispatched actions ...
  logDispatchedActions,

  // edit selCrit related ...
  initializeSelCritEdit,
  validateSelCritEdits,
  useSelCritEdits,
  saveAndUseSelCritEdits,

  // save selCrit ...
  saveSelCrit,

  // general monitoring of itemsView ...
  syncViewWhenSelCritChanged,
];
