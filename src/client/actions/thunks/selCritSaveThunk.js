'use strict'

import promoteThunk from './promoteThunk';
import {AC}         from '../actions';


/**
 * AC.selCrit.save(selCrit): an async action creator (thunk) that saves 
 * the supplied selCrit.
 *
 * @param {object} selCrit the selection criteria to save.
 */
const [selCritSaveThunk, thunkName, log] = promoteThunk('selCrit.save', (selCrit) => {
  
  return (dispatch, getState) => { // function interpreted by redux-thunk middleware

    // perform async save of selCrit
    log.debug(()=>`initiating async save of selCrit key: ${selCrit.key}`);

    geekUFetch('/api/selCrit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selCrit)
    })
    .then( res => {
      // sync app with results
      const savedSelCrit = res.payload;
      log.debug(()=>`successful save of selCrit key: ${savedSelCrit.key}`);
      dispatch( AC[thunkName].complete(savedSelCrit) ); // mark async operation complete (typically spinner)
    })
    .catch( err => {
      // communicate async operation failed
      dispatch([
        AC[thunkName].fail(selCrit, err),                                     // mark async operation FAILED complete (typically spinner)
        handleUnexpectedError(err, `saving selCrit for key: ${selCrit.key}`), // report unexpected condition to user (logging details for tech reference)
      ]);
    });

    // mark async operation in-progress (typically spinner)
    dispatch( AC[thunkName].start(selCrit) );

  };
  
});

export default selCritSaveThunk;