'use strict';

/*--------------------------------------------------------------------------------
   The GeekU client-side entry point (i.e. the mainline).
   --------------------------------------------------------------------------------*/

import './startup/ClientSidePolyfill';
import './startup/Log4GeekU'; // configure logs for GeekUApp (NOTE: include VERY early in our start-up process)

import Log               from '../shared/util/Log';
import GeekUMuiTheme     from './startup/GeekUMuiTheme';
import createAppStore    from './startup/createAppStore';
import React             from 'react';
import ReactDOM          from 'react-dom';
import MuiThemeProvider  from 'material-ui/lib/MuiThemeProvider';
import {Provider}        from 'react-redux';
import GeekUApp          from './comp/GeekUApp';
import actions           from './actions';

const log = new Log('startup');

// create our GeekU redux appStore
const appStore = createAppStore();

// emit our current Log Configuration
log.debug(()=>`Initial Log Configuration:\n${FMT(Log.config())}`);

// render our GeekUApp react component, along with our app-wide support components
log.info(()=>'render our GeekUApp react component, along with our app-wide support components');
ReactDOM.render(<Provider store={appStore}>
                  <MuiThemeProvider muiTheme={GeekUMuiTheme}>
                    <GeekUApp/>
                  </MuiThemeProvider>
                </Provider>,
                document.getElementById('app'));

// initiate our start-up bootstrap retrievals
appStore.dispatch( actions.filters.retrieve() );
