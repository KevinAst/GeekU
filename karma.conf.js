// Karma configuration
module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    // ??? remove 'webpack' to see if this fixes problem:
    // ??? Error: No provider for "framework:webpack"! (Resolving: framework:webpack)
    frameworks: ['mocha', 'webpack', 'phantomjs-shim'],
    // ??? without it ... we are NOT converting test code to ES6
    // frameworks: ['mocha', 'phantomjs-shim'],

    // list of files / patterns to load in the browser
    files: [
      'src/**/*.spec.js',
      'src/**/*.spec.jsx'
    ],

    // list of files to exclude
    exclude: [
      '**/flycheck_*' // syntax checking for GNU Emacs
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.spec.js*': [ 'webpack' ]
    },

    webpack: {
      debug: true,
      // transform: ['babelify'], // ???? ORIGINALLY COMMENTED OUT, WITH babelify ... use package.json webpack field ??? look for browserfy in package.json
      extensions: ['.js', '.jsx']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    mochaReporter: {
      output: 'autowatch'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],
    // browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}