'use strict';

import React            from 'react';
import GeekUMuiTheme    from './GeekUMuiTheme';

import AppBar           from 'material-ui/lib/app-bar';
import IconButton       from 'material-ui/lib/icon-button';
import IconMenu         from 'material-ui/lib/menus/icon-menu';
import MenuItem         from 'material-ui/lib/menus/menu-item';
import MoreVertIcon     from 'material-ui/lib/svg-icons/navigation/more-vert';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import Paper            from 'material-ui/lib/paper';
import Tab              from 'material-ui/lib/tabs/tab';
import Tabs             from 'material-ui/lib/tabs/tabs';

import autoBindAllMethods  from '../shared/util/autoBindAllMethods';

class GeekUApp extends React.Component {
  constructor(props, context) {
    super(props, context);
    autoBindAllMethods(this);
  }

  render() {
    return <MuiThemeProvider muiTheme={GeekUMuiTheme}>
      <div className="page">
        <AppBar className="page-header"
                title={
                  <span>
                    <i>GeekU</i>
                    {/* 
                    <Tabs style={{
                        width: '90%'
                      }}>
                      <Tab label="Students (Jane)"/>
                      <Tab label="Courses (CS-101)"/>
                    </Tabs>
                    */}
                  </span>}
                iconElementRight={
                  <IconMenu iconButtonElement={ <IconButton><MoreVertIcon/></IconButton> }
                            targetOrigin={{horizontal: 'right', vertical: 'top'}}
                            anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
                    <MenuItem primaryText="Refresh"/>
                    <MenuItem primaryText="Help"/>
                    <MenuItem primaryText="Sign Out"/>
                  </IconMenu>}/>
      </div>
    </MuiThemeProvider>;
  }
}

export default GeekUApp;
