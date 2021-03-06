'use strict'

import Log from './Log';


/**
 * LogMix is a Log derivation that accumulates multiple Log instances
 * functionally supporting various log filter cross cuts.
 *
 * As an example, consider a proxy API library with a native logging
 * filter of Log('api.items.retrieveItems').  This utility is invoked
 * by a logic module with a logging filter of
 * Log('actions.itemsView.retrieve').  You may wish to enable either
 * filter to see the probe.  This can be accomplished by passing the
 * "invoking" log object to the utility, and using a LogMix to
 * accumulate multiple log instances.
 *
 * @api public
 * @author Kevin Bridges
 */
class LogMix extends Log {

  /**
   * Return a cached LogMix entry, created/cached on first occurrence.
   * 
   * @param {Log[]} logs two or more log instances to accumulate (NOTE: undefined 
   * entries are automatically pruned).
   *
   * @return {LogMix}
   * 
   * @api public
   */
  static cache(...logs) {

    const [filterNameKey, prunedLogs] = defineFilterNameKey(...logs);

    // if there is only one log supplied, just use it WITHOUT wrapping in LogMix
    if (prunedLogs.length === 1) {
      return prunedLogs[0];
    }

    // pull from cache when seen before
    let logMix = _cache[filterNameKey];

    // lazily create/cache on first usage
    if (!logMix) {
      logMix = _cache[filterNameKey] = new LogMix(...prunedLogs);
    }

    return logMix;
  }


  /**
   * Construct a new LogMix instance.
   * 
   * @param {Log[]} logs two or more log instances to accumulate (NOTE: undefined 
   * entries are automatically pruned).
   * 
   * @api public
   */
  constructor(...logs) {
    super('no-op');

    const [filterNameKey, prunedLogs] = defineFilterNameKey(...logs);

    // retain logs in self
    this.logs = prunedLogs;

    // retain filterName which is an aggregate of all logs
    // ex: 'actions.itemsView.retrieve||api.items.retrieveItems'
    this.filterName = filterNameKey;
  }


  /**
   * Return an indicator as to whether the supplied level
   * is enabled for self's filter.
   *
   * @param {int} level the log level for this probe (e.g. Log.DEBUG).
   * @param {Object} obj an optional object that for Error instances,
   * can exclude client errors from the log
   *
   * @return {boolean}
   * 
   * @api public
   */
  isLevelEnabled(level, obj) {

    // if any of our contained log entries are enabled, we are enabled
    for (const log of this.logs) {
      if (log.isLevelEnabled(level, obj))
        return true;
    }
    return false;
  }

}

export default LogMix;

// cached log entries
const _cache = {}; // Key: '{filterName}', Value: LogMix instance


/**
 * Utility function to define the filterNameKey after pruning
 * undefined log entries.
 * 
 * @param {Log[]} logs two or more log instances to accumulate (NOTE: undefined 
 * entries are automatically pruned).
 *
 * @return {[filterNameKey, prunedLogs]}
 * 
 * @api private
 */
function defineFilterNameKey(...logs) {
  // prune undefined entries
  const prunedLogs = logs.prune( log => !log );

  // define our filterName key
  // ex: 'actions.itemsView.retrieve||api.items.retrieveItems'
  const filterNameKey = prunedLogs.reduce( (accum, log) => accum += (accum ? '||' : '') + log.filterName, '');

  return [filterNameKey, prunedLogs];
}

