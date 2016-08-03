'use strict'

import promoteThunk          from './promoteThunk';
import {AC}                  from '../actions';
import handleUnexpectedError from '../../util/handleUnexpectedError';

/**
 * AC.selCrit.delete(selCrit, impactView): an async action creator (thunk)
 * that deletes the supplied selCrit.
 *
 * @param {object} selCrit the selection criteria to delete.
 * @param {string} impactView view impacted by this selCrit (if any) ... 'Students'/'Courses'/null
 */
const [selCritDeleteThunk, thunkName, log] = promoteThunk('selCrit.delete', (selCrit, impactView) => {
  
  return (dispatch, getState) => { // function interpreted by redux-thunk middleware

    // perform async delete of selCrit
    log.debug(()=>`initiating async delete of selCrit key: ${selCrit.key}`);

    geekUFetch(`/api/selCrit/${selCrit.key}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selCrit)
    })
    .then( res => {
      // sync app with results
      log.debug(()=>`successful delete of selCrit key: ${selCrit.key}`);
      dispatch( AC[thunkName].complete(selCrit, impactView) ); // mark async operation complete (typically spinner)
    })
    .catch( err => {
      // communicate async operation failed
      dispatch([
        AC[thunkName].fail(selCrit, impactView, err),                           // mark async operation FAILED complete (typically spinner)
        handleUnexpectedError(err, `deleting selCrit for key: ${selCrit.key}`), // report unexpected condition to user (logging details for tech reference)
      ]);
    });

    // mark async operation in-progress (typically spinner)
    dispatch( AC[thunkName].start(selCrit, impactView) );

  };
  
});

export default selCritDeleteThunk;