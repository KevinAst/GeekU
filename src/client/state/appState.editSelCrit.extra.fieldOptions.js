import {AT}           from '../actions';
import {reducerHash}  from 'astx-redux-util';
import Log            from '../../shared/util/Log';

const log = new Log('appState.editSelCrit.extra.fieldOptions');

export default reducerHash.withLogging(log, {
  [AT.selCrit.edit]: (fieldOptions, action) => [action.fieldOptions, ()=>'set fieldOptions from action.fieldOptions'],
}, []); // initialState
