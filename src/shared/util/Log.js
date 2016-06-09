'use strict'

import assert     from 'assert';
import pad        from 'pad';
import moment     from 'moment';
import shortid    from 'shortid';
import HTTPStatus from 'http-status';

/**
 * Log is a lightweight JavaScript logging utility that promotes
 * filterable logging probes, similar to a number of frameworks such
 * as Log4J.
 *
 * By default, Log is a thin layer on top of console.log(), but is
 * configurable.
 *
 * Log is an isomorphic JavaScript utility (i.e. will operate BOTH
 * in browser/node environments.
 * 
 * Log is fully documented in Log.md.
 *
 * @api public
 * @author Kevin Bridges
 */
class Log {

  /**
   * Construct a new Log instance.
   * 
   * @param {String} filterName the filter name associated to this Log
   * instance.  This filterName can be re-used in multiple Log
   * instances.
   * 
   * @api public
   */
  constructor(filterName) {

    assert(typeof filterName === 'string', 'Log() contructor requires a filterName param of type string.');

    // retain filterName in self
    this.filterName = filterName;

    // insure the supplied filter is defined, and retain it's representation in self
    this.filterNode = _locateOrDefineFilter(filterName);
  }

//   SAMPLE: machine generated by Log.config({logLevels:[...]})
///**
// * A level-specific log() convenience method, implying a Log.DEBUG 
// * level in the method name.
// *
// * @param {function} msgFn a callback function emitting the msg string to log. 
// * @param {Object} obj an optional object (or Error) to detail in the logging probe.
// * 
// * @api public
// */
// debug(msgFn, obj) {
//   this.log(Log.DEBUG, msgFn, obj);
// }


  /**
   * Conditionally emit a message probe in our log, when enabled within our filter.
   *
   * @param {int} level the log level for this probe (e.g. Log.DEBUG).
   * @param {function} msgFn a callback function emitting the msg string to log. 
   * @param {Object} obj an optional object (or Error) to detail in the logging probe.
   * 
   * @api public
   */
  log(level, msgFn, obj) {
    // validate params
    const levelName = _levelName[level];
    assert(levelName, `Log.log(...) ERROR: Invalid log level: ${level}`);
    assert(typeof msgFn === 'function', `Log.log(...) ERROR: Supplied msgFn was NOT a function, rather  a ${typeof msgFn} type`);

    // conditionally log this message when enabled within our filter
    if ( this.isLevelEnabled(level, obj) ) {
      _outputHandler( _fmtProbe(this.filterName, levelName, msgFn, obj),
                      { // logging context
                        level,
                        levelName,
                        filterName: this.filterName
                      });
    }
  }


//   SAMPLE: machine generated by Log.config({logLevels:[...]})
///**
// * Return an indicator as to whether the DEBUG level
// * is enabled for self's filter.
// *
// * @param {Object} obj an optional object that for Error instances,
// * can exclude client errors from the log
// *
// * @return {boolean}
// * 
// * @api public
// */
//isDebugEnabled(obj) {
//  this.isLevelEnabled(Log.DEBUG, obj);
//}


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

    // define the the preliminary enablement, based on filter level high-water mark
    const filterLevel = this.filterNode.activeLevel();
    let   enabled     = filterLevel <= level;

    // exclude client Errors from the log
    if (enabled &&              // we are preliminary enabled (as far as our filter is concerned)
        _excludeClientErrors && // Log configuration allows exclusion of Errors that are caused by client
        obj &&                  // obj has been supplied
        obj instanceof Error) { // that is an Error
      const err = obj;

      // no logging is required when ...
      if (err.cause === Error.Cause.RECOGNIZED_CLIENT_ERROR || // the err is a recognized client condition, or
          err.logId) {                                         // the err has already been logged
        enabled = false;
      }
    }
        
    // that's all folks :-)
    return enabled;
  }


  /**
   * Unconditionally emit a message probe in our log.
   *
   * @param {String} msg the a message string to log (i.e. post).
   * @param {Object} obj an optional object (or Error) to detail in the logging probe.
   * 
   * @api public
   */
  static post(msg, obj) {
    const level     = 999;
    const levelName = 'POST';
    const filterName = '';

    // validate params
    assert(typeof msg === 'string', `Log.post(...) ERROR: Supplied msg was NOT a string, rather a ${typeof msg} type`);

    // unconditionally log this message
    _outputHandler( _fmtProbe(filterName, levelName, ()=>msg, obj),
                    { // logging context
                      level,
                      levelName,
                      filterName
                    });
  }


  // *** 
  // *** Configuration Related ...
  // *** 

  /**
   * The config method is used to both retrieve and/or update Log
   * configuration.  The most common usage is to maintain the filter,
   * but many other options are supported.
   *
   * A configuration object is always returned, detailing the current
   * configuration.  
   *
   * - When NO config param is supplied, config() it is used strictly as
   *   a retrieval mechanism. 
   *
   * - If a config param is supplied, updates are applied, and then
   *   the most current configuration is returned.
   * 
   *   The config param drives the configuration updates.  The properties
   *   of this object are consistent with what is retrieved, but can
   *   be sparsely populated - setting only selected configuration options.
   *
   * The configuration object is a JSON structure, with the following
   * format:
   *
   * <pre>
   *   {
   *     filter: {                      // update Log filters
   *       <filter-name>:       <level> // ex: Log.DEBUG or "DEBUG"
   *       ... ex:
   *       "root":              "INFO", // notice you can set the root of all filters
   *       "GeekApp":           "WARN",
   *       "ProcessFlow":       "DEBUG",
   *       "ProcessFlow.Enter": "none",
   *       "ProcessFlow.Exit":  "none",
   *     },
   *
   *     excludeClientErrors:   true, // exclude logged Errors that are caused by client
   *
   *     format: {         // various formatting options (currently all function hooks)
   *       "fmtProbe":     function(filterName, levelName, msgFn, obj): String,
   *       "fmtLevel":     function(levelName): String,
   *       "fmtTimeStamp": function(): String,
   *       "fmtFilter":    function(filterName): String,
   *       "fmtMsg":       function(msgFn): String,
   *       "fmtObj":       function(obj): String,
   *       "fmtError":     function(err): String,
   *     },
   *
   *     logLevels: [      // log levels (in order of severity) ... out-of-box levels shown
   *       'TRACE',
   *       'DEBUG',
   *       'INFO',
   *       'WARN',
   *       'ERROR',
   *       'FATAL',
   *       'OFF'
   *     ],
   *
   *     outputHandler: function(msgProbe): void  // output handler of completed msg probe (defaults to console.log())
   *
   *   }
   * </pre>
   *
   * @param {Object} config the sparsely populated configuration to apply (see above).
   *
   * @return {Object} the current configuration, after updates (if any) are applied.
   *
   * @api public
   */
  static config(config) {

    // ***
    // *** apply updates from supplied config param
    // ***

    if (config) {
      // apply updates to each of the supplied configuration items
      for (const configOpt in config) {
        let configVal = config[configOpt];

        switch (configOpt) {

          case 'filter':
            for (const filterName in config.filter) {
              const filterLevel = config.filter[filterName];
              _setFilter(filterName, filterLevel); // ... performs appropriate validation
            }
            break;

          case 'excludeClientErrors':
            if (typeof configVal === 'string')
              configVal = configVal === 'true';
            if (typeof configVal !== 'boolean')
              throw new Error(`Log.config() invalid excludeClientErrors value (${configVal}), must be a boolean or String ('true'/'false')`);
            _excludeClientErrors = configVal;
            break;

          case 'format':
            for (const fmtOpt in configVal) {
              let fmtVal = configVal[fmtOpt];

              // currently all format options are functions
              assert(typeof fmtVal === 'function', `Log.config() format.${fmtOpt} must reference a function`);

              switch (fmtOpt) {
                case 'fmtProbe':     _fmtProbe     = fmtVal;   break;
                case 'fmtLevel':     _fmtLevel     = fmtVal;   break;
                case 'fmtTimeStamp': _fmtTimeStamp = fmtVal;   break;
                case 'fmtFilter':    _fmtFilter    = fmtVal;   break;
                case 'fmtMsg':       _fmtMsg       = fmtVal;   break;
                case 'fmtObj':       _fmtObj       = fmtVal;   break;
                case 'fmtError':     _fmtError     = fmtVal;   break;
                // unrecognized format option
                default:
                  throw new Error(`Log.config() unrecognized configuration format setting: ${fmtOpt}`);
              }
            }
            break;

          case 'logLevels':
            _registerLevels(configVal);
            break;

          case 'outputHandler':
            assert(typeof configVal === 'function', `Log.config() outputHandler must reference a function`);
            _outputHandler = configVal;
            break;

          // unrecognized configuration option
          default:
            throw new Error(`Log.config() unrecognized configuration setting: ${configOpt}`);
        }
      }          
    }


    // ***
    // *** return the current configuration
    // ***

    // define the filter json structure
    // ... simplified for user consumption
    // ... sorted by filter name
    const filterNames = [];
    for (const filterName in _filter) {
      if (filterName !== 'root') {
        filterNames.push(filterName);
      }
    }
    filterNames.sort();
    const filter= {
    };
    if (_filter['root']) {
      filter['root'] = _levelNum2Name(_filter['root'].level) // force 'root' at top
    }
    for (const filterName of filterNames) {
      filter[filterName] = _levelNum2Name(_filter[filterName].level);
    }

    // define the log levels
    let levelNames = [];
    for (let level in _levelName) {
      levelNames.push(_levelName[level]);
    }


    // package-up/return our configuration
    const curConfig = {
      filter,
      excludeClientErrors: _excludeClientErrors,
      format: {
        fmtProbe:     _fmtProbe,
        fmtLevel:     _fmtLevel,
        fmtTimeStamp: _fmtTimeStamp,
        fmtFilter:    _fmtFilter,
        fmtMsg:       _fmtMsg,
        fmtObj:       _fmtObj,
        fmtError:     _fmtError,
      },
      logLevels:      levelNames,
      outputHandler:  _outputHandler
    };

    return curConfig;
  }


  /**
   * Return an indicator as to whether client Errors will be excluded
   * from the logs (see: excludeClientErrors configurable option).
   *
   * @return {boolean}
   * @api public
   */
  static areClientErrorsExcluded() {
    return _excludeClientErrors;
  }


  /**
   * Locate a filter, based on it's name.
   * 
   * @param {String} filterName the filter name to locate.
   *
   * @return {FilterNode} the filterNode associated to the supplied filterName.
   *
   * @api public
   */
  static filter(filterName) {
    return _locateOrDefineFilter(filterName);
  }

} // end of ... class Log

export default Log


// ***
// *** Level Related Internals
// ***

/**
 * Log Level defined constants - programmatically set via Log.config({logLevels:[...]})
 * @api public
 */
// ex ...
// Log.DEBUG = 200;

/**
 * Log Level names indexed by level num - programmatically set via Log.config({logLevels:[...]})
 * @api private
 */
let _levelName = {
  // ex ...
  // 200: 'DEBUG'
};


/**
 * Resolve supplied level to it's internal numeric representation
 * (null for none), supporting String/int/null/'none' semantics.

 * @param {int/String} level the log level (e.g. Log.DEBUG) to
 * resolve.  Use null/'none' for none (defering to parentage).
 *
 * @return {int} the internal level numeric representation (null for none).
 * @throws {Error} if invalid

 * @api private
 */
function _resolveLevel(level) {

  let levelNum = level;

  // validate/convert level
  if (typeof level === 'string') {    // ex: 'DEBUG' -or- 'none'
    levelNum = _levelName2Num(level); // ... resolves null for 'none' ... throws error if invalid
  }
  else {                              // ex: 200 (Log.DEBUG) -or- null
    _levelNum2Name(level);            // ... strictly for validation ... throws error if invalid
  }

  return levelNum;
}

/**
 * Convert Log Level name to number.  This is similar to
 * Log[levelName] with added support of "'none' to null".
 * @api private
 */
function _levelName2Num(levelName) {
  let levelNum = null;        // 'none' translates to null
  if (levelName !== 'none') { // 'none' is OK (meaining not-set)
    levelNum = Log[levelName];
    if (!levelNum) {
      throw new Error(`Invalid Log levelName: '${levelName}' (non existent)`);
    }
  }
  return levelNum;
}

/**
 * Convert Log Level number to name.  This is similar to
 * _levelName[levelNum] with added support of "null to 'none'".
 * @api private
 */
function _levelNum2Name(levelNum) {
  let levelName = 'none'; // null translates to 'none'
  if (levelNum) {         // null is OK (meaning not-set 'none')
    levelName = _levelName[levelNum];
    if (!levelName) {
      throw new Error(`Invalid Log levelNum: ${levelNum} (non existent)`);
    }
  }
  return levelName;
}

/**
 * Register all of our logging levels from scratch, clearing any prior
 * level definition.
 *
 * Typically this should be invoked very early in the apps start-up
 * process.  It doesn't make sense to redefine levels mid-stream,
 * because app logic has level knowledge embedded throughout.
 *
 * Please note that this impacts various constants and methods of the Log
 * class.  For example, if you define a "FOO" level, the following Log
 * aspects will be dynamically introduced:
 *
 *   Log.FOO               ... the numeric representation of FOO
 *   log.foo(msgFn, obj)   ... alias to log.log(Log.FOO, msgFn, obj)
 *   log.isFooEnabled(obj) ... alias to log.isLevelEnabled(Log.FOO, obj)
 *
 * Because this defines all the levels from scratch, any filters that
 * were previously defined will be reset.
 *
 * @param {String[]} levelNames the level names to define, in order of
 * severity (e.g. 'DEBUG', 'WARN', etc).  One (and only one) of the
 * levelNames MUST be prefixed with a temporal asterisk ('*') to
 * indicate the initial setting for the root level filter (ex:
 * '*INFO').
 *
 * @api private
 */
function _registerLevels(levelNames) {

  // ***
  // *** pre-process input and validate
  // ***

  assert(levelNames.length > 0, '_registerLevels() must be passed a levelNames string array with at least one entry');

  let   initialRootLevelName = null; // <String>
  const newLevelNames = []; // working copy, slightly altered from input param (asterisk stripped, OFF added)
  for (let i=0; i<levelNames.length; i++) { 
    let levelName = levelNames[i];
    assert(typeof levelName === 'string', `_registerLevels() levelNames entry number ${i+1}  is NOT a string`);
    if (levelName.indexOf('*') === 0) {
      levelName = levelName.substr(1); // strip the astrisk
      assert(!initialRootLevelName, "registerLevels() One (and only one) asterisk prefix '*' is allowed to set the root level filter");
      initialRootLevelName = levelName;
    }
    assert(levelName !== 'OFF', "registerLevels() The 'OFF' level is automatically generated and should NOT be supplied");
    newLevelNames.push(levelName);
    if (levelName.length > _levelPad) {
      _levelPad = levelName.length;
    }
  }
  assert(initialRootLevelName, `registerLevels() One (and only one) asterisk prefix '*' must be supplied to set the root level filter`);
  newLevelNames.push('OFF');


  // ***
  // *** clear prior definitions
  // ***

  let priorLevelNames = [];
  for (let level in _levelName) {
    priorLevelNames.push(_levelName[level]);
  }
  _levelName = {}; // reset all _levelName items
  for (let i=0; i<priorLevelNames.length; i++) { 
    const levelName = priorLevelNames[i];

    // remove static Log constants, for example:
    //   Log.DEBUG          = 200;
    //   _levelName[200] = 'DEBUG';
    const levelNameUpper = levelName.toUpperCase();
    delete Log[levelNameUpper];
  //delete _levelName[level]; // done globally (above)

    // remove level-specific log() convenience method, for example:
    //   log.debug(msgFn, obj); ... alias to log.log(LEVEL, msgFn, obj)
    const levelNameLower = levelName.toLowerCase();
    delete Log.prototype[levelNameLower];

    // remove level-specific isLevelEnabled() convenience method, 
    // for example:
    //   log.isDebugEnabled(obj); ... alias to log.isLevelEnabled(LEVEL, obj)
    const levelNameHumpback = levelNameLower.charAt(0).toUpperCase() + levelNameLower.slice(1);
    delete Log.prototype[`is${levelNameHumpback}Enabled`];

  }

  // clear our default output logger functions
  _defaultLoggerFn = {
    POST: console.log.bind(console)
  };


  // ***
  // *** define new definitions
  // ***

  for (let i=0; i<newLevelNames.length; i++) { 
    const levelName = newLevelNames[i];
    const level     = (i+1) * 100;

    // inject static Log constants, for example:
    //   Log.DEBUG          = 200;
    //   _levelName[200] = 'DEBUG';
    const levelNameUpper = levelName.toUpperCase();
    Log[levelNameUpper]  = level;
    _levelName[level]    = levelNameUpper;

    // inject level-specific log() convenience method, for example:
    //   log.debug(msgFn, obj); ... alias to log.log(LEVEL, msgFn, obj)
    const levelNameLower = levelName.toLowerCase();
    Log.prototype[levelNameLower] = function(msgFn, obj) {
      this.log(Log[levelNameUpper], msgFn, obj);
    };

    // inject our default output logger functions (a hash keyed by log level)
    if (levelNameUpper === 'TRACE') // trace has a different connotation in some browsers (e.g. log a stack trace) ... just use console.log
      _defaultLoggerFn[levelNameUpper] = console.log;
    else
      _defaultLoggerFn[levelNameUpper] = console[levelNameLower] || console.log;
    _defaultLoggerFn[levelNameUpper] = _defaultLoggerFn[levelNameUpper].bind(console);


    // inject level-specific isLevelEnabled() convenience method, 
    // for example:
    //   log.isDebugEnabled(obj); ... alias to log.isLevelEnabled(LEVEL, obj)
    const levelNameHumpback = levelNameLower.charAt(0).toUpperCase() + levelNameLower.slice(1);
    Log.prototype[`is${levelNameHumpback}Enabled`] = function(obj) {
      return this.isLevelEnabled(Log[levelNameUpper], obj);
    };
  }


  // ***
  // *** reset our filters
  // ***

  for (let filterName in _filter) {
    const filterNode = _filter[filterName];

    filterNode.level = filterName === 'root' ? Log[initialRootLevelName] : null;
  }

}


/**
 * Locate/return the supplied filter, defining it on first
 * reference.
 *
 * When defining a filter:
 *  - all parent hierarchy will be created (as needed)
 *  - filter levels will initially be undefined (deferring to parentage).
 * 
 * @param {String} filterName the filter name to locate/define.
 *
 * @return {FilterNode} the filterNode associated to the supplied filterName.
 *
 * @api private
 */
function _locateOrDefineFilter(filterName) {

  // if the filter is previously defined, simply return it
  const filterNode = _filter[filterName];
  if (filterNode)
    return filterNode;

  // validate supplied filterName
  assert(!/\s/g.test(filterName),
         `Log.filter('${filterName}') ERROR: filterName CANNOT contain whitespace`);

  // locate top-level root filter
  // ... dynamically create on first occurrance
  const rootName = 'root';
  let   rootNode = _filter[rootName];
  if (!rootNode) {
    rootNode = _filter[rootName] = new FilterNode(rootName, null);
    rootNode.level = Log.INFO;
  }
  // special case for 'root'
  if (filterName === 'root') {
    return rootNode;
  }

  // on first reference, dynamically create the supplied filterName
  // and all of it's parentage
  let runningName        = '';       // {String}
  let runningNode        = null;     // {FilterNode}
  let runningParentNode  = rootNode; // {FilterNode}
  const comps = filterName.split('.'); // break out the various hierarchical components within the filterName
  for (let comp of comps) {
    runningName += (runningName ? '.' : '') + comp;
    runningNode  = _filter[runningName];
    if (!runningNode) {
      runningNode = _filter[runningName] = new FilterNode(runningName, runningParentNode);
    }
    runningParentNode = runningNode;
  }

  // return the matchin FilterNode of the supplied filterName
  // ... either previously existed
  // ... or newly created
  return runningNode;
}



/**
 * Set the supplied filter level, dynamically defining the filter on
 * first reference.
 *
 * When defining a filter:
 *  - all parent hierarchy will be created (as needed)
 * 
 * @param {String} filterName the filter name to set.
 * @param {int/String} level the log level (e.g. Log.DEBUG) to set in
 * supplied filter.  Use null/'none' to undefine (defering to parentage).
 * NOTE: level may also optionally contain a note, by wrapping in an array ... [level, filterNote]
 *
 * @return {FilterNode} the filterNode associated to the supplied filterName.
 *
 * @api private
 */
function _setFilter(filterName, level) {

  // level may also optionally contain a note, by wrapping in an array ... [level, filterNote]
  let filterNote = null;
  if (Array.isArray(level)) {
    [level, filterNote] = level;
  }

  // resolve/validate supplied level (int/String) to it's internal numeric representation
  // ... null for none
  // ... exception if invalid
  level = _resolveLevel(level);

  // cannot unset 'root' level filter
  assert(filterName !== 'root' || level,
         `_setFilter('${filterName}', ${level}) ERROR: 'root' filter cannot be unset (i.e. null)`);

  // locate/define filter, and set it
  const filterNode = _locateOrDefineFilter(filterName);
  filterNode.level = level;
  if (filterNote !== null) {
    filterNode.note = filterNote
  }

  return filterNode;
}


// ***
// *** Filter Related Internals
// ***


/**
 * Log filter map.
 *   Key: filterName {String}
 *   Val: filterNode {FilterNode}
 *
 * This resource is programmatically set by one of the following:
 *   - Log() constructor          per _locateOrDefineFilter()
 *   - Log.config() configuration per _setFilter()
 *
 * @api private
 */
const _filter = {
  // ex ...
  // 'root':               filterNode(level: 300-INFO,  parent: null),
  // 'ProcessFlow':        filterNode(level: null,      parent: root.filterNode),
  // 'ProcessFlow.Enter':  filterNode(level: 200-DEBUG, parent: ProcessFlow.filterNode),
  // 'ProcessFlow.Exit':   filterNode(level: 500-ERROR, parent: ProcessFlow.filterNode)
};

/**
 * Configuration that allows exclusion of logged Errors that are
 * caused by client.
 * @api private
 */
let _excludeClientErrors = true;

/**
 * FilterNode is an internal structure representing a filter level and
 * it's parent node, providing an optimization of traversing the
 * filter hierarchy.
 *
 * @api private
 */
class FilterNode {

  /**
   * Construct a new FilterNode instance.
   * 
   * @param {String} filterName the filter name (ex: 'startup.actionCreation')
   * @param {FilterNode} parentFilterNode the parent FilterNode (null for top-level 'root')
   * 
   * @api private
   */
  constructor(filterName, parentFilterNode) {

    assert(filterName, 'FilterNode() contructor requires a filterName.');

    // special case top-level 'root' processing
    if (filterName === 'root') {
      assert(!parentFilterNode, "FilterNode() the top-level 'root' filter cannot define a parentFilterNode.");
    }

    // retain supplied parameters in self
    this.filterName = filterName;
    this.level      = null; // initially undefined level (deferring to parentage)
    this.parent     = parentFilterNode;
    this.note       = '';
  }


  /**
   * Return the run-time active level of self, looking at our
   * parentage to locate a "defined" value
   * 
   * @return {int} level
   * 
   * @api private
   */
  activeLevel() {
    if (this.level) {
      return this.level;
    }
    return this.parent.activeLevel();
  }

} // end of ... class FilterNode


// ***
// *** Format Related Internals
// ***

/**
 * Format the overall logging prope to emit.  This is the top-level
 * entry point, formatting the entire message probe.
 *
 * @param {String} filterName the log filter-name for this probe (e.g. 'appStartup').
 * @param {String} levelName the log level-name for this probe (e.g. 'DEBUG').
 * @param {function} msgFn a callback function emitting the msg string to log.
 * @param {Object} obj an optional object (or Error) to detail in the logging probe.
 *
 * @return {String}
 * @api private
 */
function _fmtProbe(filterName, levelName, msgFn, obj) {
  return `
${_fmtLevel(levelName)} ${_fmtTimeStamp()} ${_fmtFilter(filterName)}:
${pad('', _levelPad)} ${_fmtMsg(msgFn)}${_fmtObj(obj)}`;
}

/**
 * The longest level name, used in formatting (padding) the level string.
 */
let _levelPad = 0;

/**
 * Format the supplied level.
 * @param {String} levelName the log level-name for this probe (e.g. 'DEBUG').
 * @return {String}
 * @api private
 */
function _fmtLevel(levelName) {
  return pad(levelName, _levelPad);
}

/**
 * Format a 'current time' timestamp
 * @return {String}
 * @api private
 */
function _fmtTimeStamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Format the supplied filter.
 * @param {String} filterName the log filter-name for this probe (e.g. 'appStartup').
 * @return {String}
 * @api private
 */
function _fmtFilter(filterName) {
  return filterName;
}

/**
 * Format the supplied msg.
 * @param {function} msgFn a callback function emitting the msg string to log.
 * @return {String}
 * @api private
 */
function _fmtMsg(msgFn) {
  return msgFn();
}

/**
 * Format the supplied object (when defined).
 *
 * @param {Object} obj an optional object (or Error) to detail in the logging probe.
 *
 * @return {String} a formatted representation of the supplied obj (empty string [''] when not supplied.
 * @api private
 */
function _fmtObj(obj) {

  if (!obj) {
    return '';
  }

  // Errors are special
  if (obj instanceof Error) {
    return _fmtError(obj);
  }

  // Date objects don't format much in subsequent Object algorithm
  if (typeof obj.getMonth === 'function') {
    return `
    Date: ${obj}`;
  }

  // Object catch-all
  // NOTE: here is a one-level object property representaton 
  // ? let objStr = `
  // ?   Object:`;
  // ? if (obj) {
  // ?   for (let prop in obj) {
  // ?     const val = typeof(obj[prop]) === 'function' ? 'function' : obj[prop];
  // ?     objStr += `\n        ${prop}: ${val}`;
  // ?   }
  // ? }
  // ? return objStr;
  // NOTE: for now we simply treat is as aJSON object ... see if this works
  return JSON.stringify(obj, null, 2);
}


/**
 * Format the supplied error object.
 *
 * @param {Error} err the error object to detail in the logging probe.
 *
 * @return {String} a formatted representation of the supplied error.
 * @api private
 */
function _fmtError(err) {

  // define a logId for this Error
  err.logId = shortid.generate();
  
  // return our formatted representation of the err
  let msg =  `
    Error:
      Name:       ${err.name}`;
  if (err.httpStatus)
    msg += `
      Status:     ${err.httpStatus}
      StatusMsg:  ${HTTPStatus[err.httpStatus]}`;
  msg += `
      Client Msg: ${err.clientMsg}
      Message:    ${err.message}`;
  if (err.url)
    msg += `
      URL:        ${err.url}`;
  msg += `
      LogId:      ${err.logId}
      Stack Trace:
       ${err.stack}
`;
  return msg;
}


// ***
// *** Output Handler
// ***

/**
 * A hash referencing the default output logger functions, 
 * machine generated, keyed by levelName.
 * 
 * Ex: 
 *    {
 *      'POST':  console.log,
 *      'TRACE': console.log,
 *      'DEBUG': console.debug,
 *      'INFO':  console.info,
 *      'WARN':  console.warn,
 *      'ERROR': console.error,
 *      'FATAL': console.log
 *    }
 */
let _defaultLoggerFn = {};

/**
 * Output handler of completed msg probe (defaults to console.log()).
 *
 * @param {String} msgProbe the completed msg probe, ready to output.
 * @param {Object} context a log context object containing the level, levelName, and filterName.
 * @api private
 */
function _outputHandler(msgProbe, context) {
  _defaultLoggerFn[context.levelName](msgProbe);
}


// ***
// *** Register our out-of-the-box levels
// ***

Log.config({ 
  logLevels: [
    'TRACE',
    'DEBUG',
    '*INFO',
    'WARN',
    'ERROR',
    'FATAL'
  ]
});
