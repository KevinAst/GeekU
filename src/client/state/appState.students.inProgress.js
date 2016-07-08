'use strict'

import {AT}            from './actions';
import ReduxSubReducer from '../util/ReduxSubReducer';


// ***
// *** appState.students.inProgress reducer
// ***

const subReducer = new ReduxSubReducer('appState.students.inProgress', {
  [AT.retrieveStudents.start]    (inProgress, action) { return addIn(inProgress, +1); },
  [AT.retrieveStudents.complete] (inProgress, action) { return addIn(inProgress, -1); },
  [AT.retrieveStudents.fail]     (inProgress, action) { return addIn(inProgress, -1); },
});

function addIn(val, additive) {
  let newVal = val + additive;
  if (newVal < 0)
    newVal = 0; // never let it go negative ... even if we have something out of sync
  return [newVal, ()=>`setting inProgress to: ${newVal}`];
}

export default function inProgress(inProgress=0, action) {
  return subReducer.resolve(inProgress, action);
}
