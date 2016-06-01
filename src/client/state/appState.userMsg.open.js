'use strict'

import {AT}      from './actions';
import ReduxUtil from '../util/ReduxUtil';

import Log from '../../shared/util/Log';

const reducerName = 'appState.userMsg.open';
const log         = new Log(reducerName);

// ***
// *** appState.userMsg.open reducer
// ***

const reducers = { // our sub-reducers (in lieu of switch statement)
  
  [AT.displayUserMsg](open, action) {
    // ??? consolidate and make debug
    log.info(()=>`in sub-reducer ${reducerName}, action: '${action.type}' ... setting open: true`);
    log.info(()=>'AT.displayUserMsg: updating open: true');
    return true;
  },
                   
  [AT.closeUserMsg](open, action) {
    // ??? consolidate and make debug
    log.info(()=>`in sub-reducer ${reducerName}, action: '${action.type}' ... setting open: false`);
    log.info(()=>'AT.closeUserMsg: updating open: false');
    return false;
  },

};

export default function open(open=false, action) {
  // ??? debug
  log.info(()=>`in reducer: ${reducerName}, action: '${action.type}'`); // ??? can almost do this in resolveReducer
  return ReduxUtil.resolveReducer(reducers, open, action)
}
