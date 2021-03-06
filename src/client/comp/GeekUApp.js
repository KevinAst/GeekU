'use strict';

import React              from 'react';
import * as ReactRedux    from 'react-redux';
import {autobind}         from 'core-decorators';
import AppBar             from 'material-ui/lib/app-bar';
import IconButton         from 'material-ui/lib/icon-button';
import IconMenu           from 'material-ui/lib/menus/icon-menu';
import MenuItem           from 'material-ui/lib/menus/menu-item';
import MoreVertIcon       from 'material-ui/lib/svg-icons/navigation/more-vert';
import Paper              from 'material-ui/lib/paper';
import Tab                from 'material-ui/lib/tabs/tab';
import Tabs               from 'material-ui/lib/tabs/tabs';
import CoursesView        from './CoursesView';
import StudentsView       from './StudentsView';
import UserMsg            from './UserMsg';
import Alert              from './Alert';
import actions            from '../actions';
import selectors          from '../state';
import LeftNav            from './LeftNav';
import EditSelCrit        from './EditSelCrit';
import SelCrit            from '../../shared/domain/SelCrit';
import itemTypes          from '../../shared/domain/itemTypes';

import { DragDropContext } from 'react-dnd';
import HTML5Backend        from 'react-dnd-html5-backend';


/**
 * Top-Level GeekUApp component.
 */

@DragDropContext(HTML5Backend)

@ReactRedux.connect( (appState, ownProps) => {
  return {
    activeView:      selectors.getActiveView(appState),
    selectedStudent: selectors.getItemsViewSelectedItem(appState, itemTypes.student),
    selectedCourse:  selectors.getItemsViewSelectedItem(appState, itemTypes.course),
  }
})

@autobind

export default class GeekUApp extends React.Component {

  static propTypes = { // expected component props
  }

  constructor(props, context) {
    super(props, context);
  }

  activateView(itemType) {
    const p = this.props;
    p.dispatch( actions.itemsView.activate(itemType) );
  }

  tempAlert() {
    const p = this.props;
    const directive1 = {
      title: 'Test Alert 1',
      msg:   'This is a test of our Alert Dialog!',
      actions: [  
        {txt: 'Option 1',  action: () => p.dispatch( actions.userMsg.display('User chose Option 1') ) },
        {txt: 'Option 2',  action: () => p.dispatch( actions.userMsg.display('User chose Option 2') ) },
        {txt: 'Alert A', action: () => Alert.display(directiveA) },
        {txt: 'Cancel' },
      ]
    };
    const directiveA = {
      title: 'Test Alert A',
      msg:   'This is a test of our Alert Dialog!',
      actions: [  
        {txt: 'Option A', action: () => p.dispatch( actions.userMsg.display('User chose Option A') ) },
        {txt: 'Option B', action: () => p.dispatch( actions.userMsg.display('User chose Option B') ) },
        {txt: 'Cancel' },
      ]
    };
    const directiveX = {
      title: 'Test Alert X',
      msg:   'This is a test of our Alert Dialog!',
      actions: [  
        {txt: 'Option X', action: () => p.dispatch( actions.userMsg.display('User chose Option X') ) },
        {txt: 'Option Y', action: () => p.dispatch( actions.userMsg.display('User chose Option Y') ) },
        {txt: 'Cancel' },
      ]
    };
    Alert.display(directive1);
    Alert.display(directiveX); // test multiple concurrent alerts
    Alert.display({msg: <span style={{color: 'red'}}>This is a simple Alert</span>});
  }

  tempSampleMsg() {
    const p = this.props;
    p.dispatch( actions.userMsg.display(`Sample Message on ${new Date()}`) );
  }

  tempSampleMultiMsg() {
    const p = this.props;
    p.dispatch( actions.userMsg.display(`Sample Multi-Message 1`) );
    p.dispatch( actions.userMsg.display(`Sample Multi-Message 2`) );
  }

  tempSampleMsgWithUserAction() {
    const p = this.props;
    p.dispatch( actions.userMsg.display('Msg with User Action!', 
                                   {
                                     txt:      'details',
                                     callback: () => alert('here are the details: bla bla bla')
                                   }) );
  }

  render() {
    const p = this.props;

    // studentNum is used as a back-up if name is NOT retrieved (studentNum is ALWAYS returned)
    const selectedStudentName = p.selectedStudent ? `(${p.selectedStudent.firstName || p.selectedStudent.lastName || p.selectedStudent.studentNum})` : '';
    const selectedCourseNum   = p.selectedCourse  ? `(${p.selectedCourse.courseNum})` : '';

    return <div className="app">
      <AppBar className="app-header"
              title={
                <table>
                  <tbody>
                    <tr>
                      <td><i>GeekU</i></td>
                      <td>
                        <Tabs value={p.activeView}
                              onChange={this.activateView}>
                          <Tab value={itemTypes.course}  style={{textTransform: 'none', width: '15em'}} label={<span>Courses  <i>{selectedCourseNum}</i></span>}/>
                          <Tab value={itemTypes.student} style={{textTransform: 'none', width: '15em'}} label={<span>Students <i>{selectedStudentName}</i></span>}/>
                        </Tabs>
                      </td>
                    </tr>
                  </tbody>
                </table>}
              onLeftIconButtonTouchTap={()=>LeftNav.open()}
              iconElementRight={
                <IconMenu iconButtonElement={ <IconButton><MoreVertIcon/></IconButton> }
                          targetOrigin={{vertical: 'top', horizontal: 'right', }}
                          anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                  <MenuItem primaryText="Refresh"/>
                  <MenuItem primaryText="Help"/>
                  <MenuItem primaryText="Sign Out"/>

                  <MenuItem primaryText="Sample Alerts"                    onTouchTap={this.tempAlert}/>
                  <MenuItem primaryText="Sample Message"                   onTouchTap={this.tempSampleMsg}/>
                  <MenuItem primaryText="Sample Multi-Message"             onTouchTap={this.tempSampleMultiMsg}/>
                  <MenuItem primaryText="Sample Message with User Action"  onTouchTap={this.tempSampleMsgWithUserAction}/>
                </IconMenu>}/>
      <LeftNav/>
      <CoursesView/>
      <StudentsView/>
      <EditSelCrit/>
      <UserMsg/>
      <Alert/>
    </div>;
  }
}
