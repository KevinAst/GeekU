'use strict'

import {AT}             from '../actions';
import ReductionHandler from '../util/ReductionHandler';


// ***
// *** appState.studentsView.detailStudent reducer
// ***

const reductionHandler = new ReductionHandler('appState.studentsView.detailStudent', {

  [AT.detailStudent.retrieve.complete](detailStudent, action) {
    return [
      action.student,
      ()=>'set detailStudent from action.student ... ' + FMT(action.student)
    ];
  },

  [AT.detailStudent.close](detailStudent, action) {
    return [
      null,
      ()=>'clearing detailStudent'
    ];
  },

});

export default function detailStudent(detailStudent=null, action) {
  return reductionHandler.reduce(detailStudent, action);
}