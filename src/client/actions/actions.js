'use strict'

import selCritSaveThunk      from './thunks/selCritSaveThunk';
import retrieveStudentsThunk from './thunks/retrieveStudentsThunk';
import detailStudentThunk    from './thunks/detailStudentThunk';
import retrieveFiltersThunk  from './thunks/retrieveFiltersThunk';

import userMsgDisplayAC      from './creators/userMsgDisplayAC';

import generate_AT_AC        from './generate_AT_AC';


/**
 * Promote all actions used in our app ... both:
 *
 *   - AC: Action Creators
 *         A series of public functions that create actions.
 *         EX Usage:  AC.userMsg.display(msg): Action
 *         EX Action: { type: "userMsg.display", msg }
 *
 *   - AT: Action Types
 *         A series of Strings, representing our Action Types
 *         (used internally by our reducers [injected into each action]).
 *         EX: AT.userMsg.display = "userMsg.display"
 *
 * NOTES: 
 *
 *   - To determine what Action Creators/Types are availble (AC/AT), simply interpret
 *     the genesis structure (below) as follows:
 *      * The genesis key is both the AC function name and the AT type
 *      * The genesis value.params array represents the expected AC function parameters
 *        and the AT action type state.
 *     EXAMPLE: AC.userMsg.display(msg): Action
 *
 *   - AC/AT may contain dots ('.') ... i.e. a federated namespace.
 *     In this case you may use one of two reference techniques
 *     ... the following are equivalent:
 *       * AC.userMsg.display('Hello World');
 *         AC['userMsg.display']('Hello World'); // SAME AS PRIOR LINE
 *       * AT.userMsg.display    // ... yeilds type: 'userMsg.display'
 *         AT['userMsg.display'] // ... SAME AS PRIOR LINE
 *
 *   - To support federated namespace, the action types (AT) utilize
 *     String objects, rather than native strings.
 *       * This allows an intermediate sub-type (String) to contain
 *         additional properties (i.e. more detailed types)
 *       * KEY: Because of this, you cannot rely on === semantics
 *         in compairing type strings.
 *         ... you can utilize === semantics with type.valueOf()
 *
 * INTERNAL NOTES: 
 *
 *   This technique of creating AC/ATs has the following benefits:
 *   
 *    - The Action Creators (AC) 
 *      * Concisely defines all the actions you can perform within the app
 *      * Promotes and validates the exact set of expected parameters
 *        ... at least the number of parameters
 *        ... the parameter types are NOT validated, but the name gives a hint of expectations
 *        ... here is an example error that is thrown if number of params are incorrect:
 *            ERROR: Action Creator AC.retrieveStudents.complete(selCrit) expecting 2 parameters, but received 1
 *      * Correctly constructs the action every time
 *   
 *    - The Action Types (AT):
 *      * Are consisely defined from the same definition
 *   
 *    - Minimal development effort in maintaining the AC/ATs
 */

const genesis = {

  'userMsg.display':           { params: ['msg', 'userAction'],       ac: userMsgDisplayAC },
  'userMsg.close':             { params: [] },

  'changeMainPage':            { params: ['mainPage'] }, // mainPage: 'Students'/'Courses'

  'retrieveStudents':          { params: ['selCrit'],                 thunk: retrieveStudentsThunk },
  'retrieveStudents.start':    { params: ['selCrit'] },
  'retrieveStudents.complete': { params: ['selCrit', 'items'] },
  'retrieveStudents.fail':     { params: ['selCrit', 'error'] },

  'selectStudent':             { params: ['student'] }, // null for de-select

  // TODO: suspect this is a code smell - the detailStudent has mixed-in the retrieval (retrieval prob should be a seperate AC)
  'detailStudent':                    { params: ['studentNum', 'editMode'],  thunk: detailStudentThunk },
  'detailStudent.retrieve.start':     { params: ['studentNum', 'editMode'] },
  'detailStudent.retrieve.complete':  { params: ['student',    'editMode'] },
  'detailStudent.retrieve.fail':      { params: ['studentNum', 'err'] },
  'detailStudent.close':              { params: [] },
  'detailStudent.changeEditMode':     { params: [] },

  'retrieveFilters':          { params: [],    thunk: retrieveFiltersThunk },
  'retrieveFilters.start':    { params: [] },
  'retrieveFilters.complete': { params: ['filters'] },
  'retrieveFilters.fail':     { params: ['error'] },

  // PRIVATE AC: emitted from <EditSelCrit>
  'selCrit.edit':              { params: ['selCrit', 'meta'] }, // start a selCrit edit session
  'selCrit.edit.nameChange':   { params: ['name'] },
  'selCrit.edit.descChange':   { params: ['desc'] },
  'selCrit.edit.fieldsChange': { params: ['selectedFieldOptions'] },
  'selCrit.edit.sortChange':   { params: ['selectedSortOptions'] },
  'selCrit.edit.filterChange': { params: ['newFilter'] },
  'selCrit.edit.distinguishMajorSortFieldChange': { params: ['value'] },
  'selCrit.edit.close':        { params: [] },  // close dialog
  // PUBLIC AC: emitted from <EditSelCrit>
  'selCrit.edit.changed':      { params: ['selCrit'] }, // selCrit has changed with the app ... see EditSelCrit.js for full doc

  'selCrit.save':          { params: ['selCrit'],    thunk: selCritSaveThunk },
  'selCrit.save.start':    { params: ['selCrit'] },
  'selCrit.save.complete': { params: ['selCrit'] },
  'selCrit.save.fail':     { params: ['selCrit', 'error'] },

};


// machine generate (and promote) our AT (Action Types), and AC (Action Creators)
const  {AT, AC} = generate_AT_AC(genesis);
export {AT, AC};