// Karma configuration
module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'phantomjs-shim'],

    // instruct mocha client to only run NON-INTEGRATION tests
    client: {
      // NOTE: can't get mocha's --invert to work, hence the complex regexp
    //args: ['--grep', 'INTEGRATION', '--invert'], 
      args: ['--grep', '^((?!INTEGRATION).)*$'], // ... same as above (without --invert working)
    },

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
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.js$/,   exclude: /node_modules/, loader: 'babel' },
          { test: /\.json$/, loader: 'json-loader' }
        ]
      },
      resolve: {
        extensions: ['', '.json', '.js', '.jsx']
      }
    },

    webpackServer: {
      noInfo: true
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
