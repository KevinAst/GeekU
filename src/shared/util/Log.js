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
 * By default, Log is a thin layer on top of console.log(), simply 
 * adding filters.
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

    assert(filterName, 'Log() contructor requires a filterName.');

    // retain filterName in self
    this.filterName = filterName;

    // insure the supplied filter is defined, and retain it's representation in self
    this.filterNode = Log.locateOrDefineFilter(filterName);
  }


//   SAMPLE: machine generated by Log.registerLevel(levelName, level)
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
      console.log( Log.formatMsg(this.filterName, levelName, msgFn, obj) );
    }
  }


//   SAMPLE: machine generated by Log.registerLevel(levelName, level)
///**
// * Return an indicator as to whether the DEBUG level
// * is enabled for self's filter.
// *
// * @param {Object} obj an optional object that for Error instances,
// * can veto the enablement.
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
   * can veto the enablement.
   *
   * @return {boolean}
   * 
   * @api public
   */
  isLevelEnabled(level, obj) {

    // define the the preliminary enablement, based on filter level high-water mark
    const filterLevel = this.filterNode.activeLevel();
    let   enabled     = filterLevel <= level;

    // allow supplied Error object to veto the probe emission
    if (enabled &&                // we are preliminary enabled (as far as our filter is concerned)
        _allowClientErrorToVetoLogs && // our configuation allows client Errors to veto the log
        obj &&                    // obj has been supplied
        obj instanceof Error) {   // that is an Error
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
   * - If a config param is supplied, updates are applied, and the most
   *   current configuration is returned.
   * 
   *   The config param drives the configuration updates.  The properties
   *   of this object are consistent with what is retrieved, but can
   *   be sparsly populated - setting only selected config.
   *
   * The configuration object is a JSON structure, with the following
   * format:
   *
   * <pre>
   *   {
   *     more: ??$$,
   *     filter: {
   *       <filter-name>:       <log-level>
   *       ... ex:
   *       "root":              "INFO", ... notice you can set the root of all filters
   *       "GeekApp":           "WARN",
   *       "ProcessFlow":       "DEBUG",
   *       "ProcessFlow.Enter": "none",
   *       "ProcessFlow.Exit":  "none",
   *     }
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

        switch (configOpt) { // ??? change to new SwitchProcessor ... possibly externally defined

          case 'allowClientErrorToVetoLogs':
            if (typeof configVal === 'string')
              configVal = configVal === 'true';
            if (typeof configVal !== 'boolean')
              throw new Error(`Log.config() invalid allowClientErrorToVetoLogs value (${configVal}), must be a boolean or String ('true'/'false')`);
            _allowClientErrorToVetoLogs = configVal;
            break;

          case 'filter':
            for (const filterName in config.filter) {
              const filterLevel = config.filter[filterName];
              Log.setFilter(filterName, filterLevel); // ... performs appropriate validation
            }
            break;

          // unrecognized option
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
      'root': levelNum2Name(_filter['root'].level) // force 'root' at top
    };
    for (const filterName of filterNames) {
      filter[filterName] = levelNum2Name(_filter[filterName].level);
    }

    // package-up/return our configuration
    const curConfig = {
      allowClientErrorToVetoLogs: _allowClientErrorToVetoLogs,
      // ?? more
      filter
    };

    return curConfig;
  }


  /**
   * Return an indicator as to whether client Errors will veto the log
   * emission (see: allowClientErrorToVetoLogs configurable option).
   *
   * @return {boolean}
   * @api public
   */
  static willClientErrorVetoLogs() {
    return _allowClientErrorToVetoLogs;
  }

  /**
   * Register a logging level.  This method is typically invoked
   * internally to establish the standard base levels, however any
   * number of additional levels can be registered by the Log client.
   *
   * @param {String} levelName the level name (e.g. DEBUG, WARN, etc)
   * @param {int} level the cooresponding numeric log level.  The
   * greater the level the more severe (e.g. ERROR of 500 is more
   * severe than INFO of 300).
   *
   * @api public
   */
  static registerLevel(levelName, level) {

    // inject static Log constants, for example:
    //   Log.DEBUG          = 200;
    //   _levelName[200] = 'DEBUG';
    const levelNameUpper = levelName.toUpperCase();
    Log[levelNameUpper]  = level;
    _levelName[level]    = levelNameUpper;

    // inject level-specific log() convenience method, for example:
    //   log.debug(msgFn, obj); ... alias to log.log(LEVEL, txFn, obj)
    const levelNameLower = levelName.toLowerCase();
    Log.prototype[levelNameLower] = function(msgFn, obj) {
      this.log(Log[levelNameUpper], msgFn, obj);
    };

    // inject level-specific isLevelEnabled() convenience method, 
    // for example:
    //   log.isDebugEnabled(obj); ... alias to log.isEnabled(LEVEL, obj)
    const levelNameHumpback = levelNameLower.charAt(0).toUpperCase() + levelNameLower.slice(1);
    Log.prototype[levelNameHumpback] = function(obj) {
      this.isLevelEnabled(Log[levelNameUpper], obj);
    };
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
  static locateOrDefineFilter(filterName) {
    // purge any filterName whitespace
    filterName = filterName.replace(/\s+/g, '');

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
   *
   * @return {FilterNode} the filterNode associated to the supplied filterName.
   *
   * @api private
   */
  static setFilter(filterName, level) {

    // resolve/validate supplied level (int/String) to it's internal numeric representation
    // ... null for none
    // ... exception if invalid
    level = resolveLevel(level);
  //assert(level === null || _levelName[level], // ??? THINK obsolete
  //       `setFilter('${filterName}', ${level}) ERROR: Invalid level: ${level}`);

    // cannot unset 'root' level filter
    assert(filterName !== 'root' || level,
           `setFilter('${filterName}', ${level}) ERROR: 'root' filter cannot be unset (i.e. null)`);

    // locate/define filter, and set it
    const filterNode = Log.locateOrDefineFilter(filterName);
    filterNode.level = level;

    return filterNode;
  }



  // *** 
  // *** Utility Related ...
  // *** 

  /**
   * Format the log entry to emit.
   *
   * @param {String} filterName the log filter-name for this probe (e.g. 'appStartup').
   * @param {String} levelName the log level-name for this probe (e.g. 'DEBUG').
   * @param {function} msgFn a callback function emitting the msg string to log.
   * @param {Object} obj an optional object (or Error) to detail in the logging probe.
   *
   * @return {String} the formatted message to log
   *
   * @api private (however can be re-set in initial Log configuration)
   */
  // ?? make private _formatMsg with ability to re-config
  static formatMsg(filterName, levelName, msgFn, obj) {
    return `
${pad(levelName, 5)} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${filterName}${Log.extra()}:
      ${msgFn()}${Log.formatObj(obj)}`;
  };

  // ?? temp for now
  static extra() {
    return '';
  };


  /**
   * Format the supplied object (when defined).
   *
   * @param {Object} obj an optional object (or Error) to detail in the logging probe.
   *
   * @return {String} a formatted representation of the supplied obj (empty string [''] when not supplied.
   *
   * @api private (however can be re-set in initial Log configuration)
   */
  // ?? make private _formatObj with with ability to re-config
  static formatObj(obj) {

    if (!obj) {
      return '';
    }

    // Errors are special
    if (obj instanceof Error) {
      return Log.formatError(obj);
    }

    // Date objects don't format much in subsequent Object algorithm
    if (typeof obj.getMonth === 'function') {
      return `
      Date: ${obj}`;
    }

    // Object catch-all
    // ?? here is a one-level object property representaton 
    // ? let objStr = `
    // ?   Object:`;
    // ? if (obj) {
    // ?   for (let prop in obj) {
    // ?     const val = typeof(obj[prop]) === 'function' ? 'function' : obj[prop];
    // ?     objStr += `\n        ${prop}: ${val}`;
    // ?   }
    // ? }
    // ? return objStr;
    // ?? can I get by just treating it like a JSON object?
    return JSON.stringify(obj, null, 2);
  }


  /**
   * Format the supplied error object.
   *
   * @param {Error} err the error object to detail in the logging probe.
   *
   * @return {String} a formatted representation of the supplied error.
   *
   * @api private (however can be re-set in initial Log configuration)
   */
  // ?? make private _formatError with with ability to re-config
  static formatError(err) {

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

} // end of ... class Log



// ***
// *** Level Related internal/static
// ***

/**
 * Log Level defined constants - programmatically set via Log.registerLevel()
 * @api public
 */
// ex ...
// Log.DEBUG = 200;

/**
 * Log Level names indexed by level num - programmatically set via Log.registerLevel()
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
// ?? NEW
function resolveLevel(level) {

  let levelNum = level;

  // validate/convert level
  if (typeof level === 'string') {   // ex: 'DEBUG' -or- 'none'
    levelNum = levelName2Num(level); // ... resolves null for 'none' ... throws error if invalid
  }
  else {                             // ex: 200 (Log.DEBUG) -or- null
    levelNum2Name(level);            // ... strictly for validation ... throws error if invalid
  }

  return levelNum;
}

/**
 * Convert Log Level name to number.  This is similar to
 * Log[levelName] with added support of "'none' to null".
 * @api private
 */
// ?? NEW
function levelName2Num(levelName) {
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
// ?? NEW
function levelNum2Name(levelNum) {
  let levelName = 'none'; // null translates to 'none'
  if (levelNum) {         // null is OK (meaning not-set 'none')
    levelName = _levelName[levelNum];
    if (!levelName) {
      throw new Error(`Invalid Log levelNum: ${levelNum} (non existent)`);
    }
  }
  return levelName;
}




// ***
// *** Filter Related internal/static
// ***


/**
 * Log filter map.
 *   Key: filterName {String}
 *   Val: filterNode {FilterNode}
 *
 * This resource is programmatically set by one of the following:
 *   - Log() constructor          per Log.locateOrDefineFilter()
 *   - Log.config() configuration per Log.setFilter()
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
 * Configuration that allows client Error objects to veto the log emission
 * @api private
 */
let _allowClientErrorToVetoLogs = true;



// register our initial standard base levels
Log.registerLevel('TRACE', 100);
Log.registerLevel('DEBUG', 200);
Log.registerLevel('INFO',  300);
Log.registerLevel('WARN',  400);
Log.registerLevel('ERROR', 500);
Log.registerLevel('FATAL', 600);
Log.registerLevel('OFF',   999);



export default Log




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
   * @param {String} filterName the filter name.
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
