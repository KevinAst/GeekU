'use strict'

import actionTypeAmplified from '../util/actionTypeAmplified';
import Log                 from '../../shared/util/Log';

/**
 * A ReductionHandler object orchestrates redux state changes through
 * a set of handler functions indexed by the standard redux
 * action.type.
 *
 * In it's most rudimentary form, this class provides a more elegant
 * solution to the switch statement, commonly used to provide this
 * control mechanism.  With that said, the functionality is specific
 * to reduction, because of the value-added logic in action
 * interpretation, state changes, etc.
 *
 * One of the value-added benefits of using ReductionHandler is the
 * promotion of a very useful logging feature, that distinguishes
 * between state changes.  This provides a means to enable logging at 
 * a high-level, with a concise recording of reducers that actually 
 * changed state.  The following log levels are employed:
 *
 *   INSPECT: monitor reducer state changes only
 *   DEBUG:   include explicit reducer reasoning (regardless if state changes)
 *   TRACE:   include ALL reducer enter/exit points (NO real value - simply shows ALL appState reducers)
 *
 * This is made possible because of the central role ReductionHandler
 * plays in the reduction process.
 * 
 * @api public
 * @author Kevin Bridges
 */
class ReductionHandler {

  /**
   * Construct a ReductionHandler instance with the supplied parameters.
   *
   * @param {string} reducerName the name of our reducer, driving the
   * logging filter name.
   *
   * @param {Object} handlers the handlers object containing a
   * set of handler functions indexed by the standard redux
   * action.type.
   * 
   * Each handler function has the following signature:
   *   function(state, action): [nextState, logMsgFn]
   * 
   * For example:
   *   {
   *     [AT.retrieveStudents.complete](items, action) {
   *       return [
   *         action.items,
   *         ()=>`set items from action: ${action.items.length} students`
   *       ];
   *     },
   *     ... more
   *   }
   */
  constructor(reducerName, handlers) {
    this.reducerName = reducerName;
    this.handlers    = handlers;
    this.log         = new Log(reducerName);
  }

  /**
   * Resolve the next redux state, by giving control to a handler
   * (if any).  If no applicable handler is found, the current
   * state is returned.
   * 
   * @param {Object} state the current redux state.
   * @param {Object} action the standard redux action, who's state
   * property drives the handler redirection.
   * 
   * @return {Object} the next redux state.
   */
  reduce(state, action) {

    // resolve our next state
    const handler = this.handlers[action.type];
    const [nextState, logMsgFn] = handler
                                   ? handler(state, action) 
                                   : [state, null];


    // apply our value-added logging probe that distinguishes between
    // state changes, allowing INSPECT/DEBUG enablement at a
    // high-logging-level with useful insight and minimal output!
    // Log Levels: 
    //   INSPECT: monitor reducer state changes only
    //   DEBUG:   include explicit reducer logic reasoning (regardless if state changes)
    //   TRACE:   include ALL reducer enter/exit points (NO real value - simply shows ALL appState reducers)
    const logIt = ((state !== nextState)
                    ? this.log.inspect    // state change - use log.inspect()
                    : (handler)
                        ? this.log.debug  // no state change, but app-specific logic - use log.debug()
                        : this.log.trace) // no state change, and no app-logic = use log.trace()
                  .bind(this.log);
    logIt(()=> {
      const stateChangedMsg  = state !== nextState
                                ? '(STATE CHANGED)'
                                : '(*NO* state change)';
      const handlerMsg       = handler 
                                ? `... handler: ${logMsgFn()}`
                                : '';
      return `Reducer: ${this.reducerName}, Action: '${actionTypeAmplified(action)}' ${stateChangedMsg} ${handlerMsg}`;
    });
    
    // return our next state
    return nextState;
  }

  /**
   * Log message in a standardized way, used by "non ReductionHandler"
   * Reducer logic.  Similar format to the ReductionHandler log (above).
   * 
   * @param {Object}  action       the standard redux action involved.
   * @param {boolean} stateChanged indicator as to whether the state has changed.
   * @param {string}  msg          the message to log
   */
  logStandardizedMsg(action, stateChanged, msg) {
    const logIt = (stateChanged
                 ? this.log.inspect // state change    - use log.inspect()
                 : this.log.debug)  // no state change - use log.debug()
                       .bind(this.log);
    logIt(()=> {
      const stateChangedMsg  = stateChanged
                             ? '(STATE CHANGED)'
                             : '(*NO* state change)';
      return `Reducer: ${this.reducerName}, Action: '${actionTypeAmplified(action)}' ${stateChangedMsg} ... ${msg}`;
    });
  }

}

export default ReductionHandler