'use strict';

import promoteLogic      from './util/promoteLogic';
import getActionLogicLog from './util/getActionLogicLog';

import {AC}              from '../actions';
import selectors         from '../state';
import SelCrit           from '../../shared/domain/SelCrit';


/**
 * Validate selCrit edits on completion.
 */
const [logicName, logic] = promoteLogic('validateSelCritEdits', {

  type: ['selCrit.edit.use',
         'selCrit.edit.save'],

  validate({getState, action}, allow, reject) {

    const log = getActionLogicLog(action, logicName);

    const appState = getState();
    const selCrit  = selectors.getEditSelCrit(appState).selCrit;

    // apply validation
    const invalidMsg = SelCrit.validate(selCrit);
    if (invalidMsg) {
      log.debug(()=> `rejecting action: ${FMT(action.type)} due to validation errors: ${invalidMsg}`);
      reject( AC.userMsg.display('Please resolve the highlighted validation errors.') );
    }
    else {
      allow( action );
    }
  },

});

export default logic;