'use strict';

import * as LOGIC  from './LogicUtil';
import {AT, AC}    from '../actions';
import api         from '../../shared/api';


/**
 * Process (i.e. implement) the AT.selCrit.save action.
 */
const [logicName, logic] = LOGIC.promoteLogic('processSelCritSaveAction', {

  type: AT.selCrit.save.valueOf(),

  process({getState, action}, dispatch) {

    const log = LOGIC.getActionLog(action, logicName);

    const selCrit       = action.selCrit;
    const syncDirective = action.syncDirective;

    api.filters.saveFilter(selCrit, log)
       .then( savedSelCrit => {
         // mark async operation complete (typically spinner)
         dispatch( AC.selCrit.save.complete(savedSelCrit), LOGIC.allowMore );
         // sync app with results
         dispatch( AC.selCrit.changed(savedSelCrit, syncDirective) );
       })
       .catch( err => {
         // mark async operation FAILED (typically spinner)
         // ... NOTE: monitored '*.fail' logic will communicate to the user, and log details
         dispatch( AC.selCrit.save.fail(selCrit, 
                                        err.defineAttemptingToMsg(`saving selCrit: ${selCrit.name}`)) );
       });
  },

});

export default logic;
