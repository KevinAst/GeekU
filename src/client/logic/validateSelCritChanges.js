'use strict';

import createNamedLogic, * as LOGIC  from './util/createNamedLogic';
import actions    from '../actions';
import selectors  from '../state';
import SelCrit    from '../../shared/domain/SelCrit';


/**
 * Validate selCrit edits on completion.
 */
export default createNamedLogic('validateSelCritChanges', {

  type: [String(actions.selCrit.edit.use),
         String(actions.selCrit.edit.save)],

  validate({getState, action, log}, allow, reject) {

    const appState = getState();
    const selCrit  = selectors.getEditSelCrit(appState).selCrit;

    // apply validation
    const invalidMsg = SelCrit.validate(selCrit);
    if (invalidMsg) {
      log.debug(()=> `rejecting action: ${FMT(action.type)} due to validation errors: ${invalidMsg}`);
      reject( actions.userMsg.display('Please resolve the highlighted validation errors.') );
    }
    else {
      log.debug(()=> `validation passed - selCrit: ${selCrit.name} is valid`);
      allow( action );
    }
  },

});
