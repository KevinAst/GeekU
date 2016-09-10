'use strict';

import React               from 'react';
import * as ReactRedux     from 'react-redux';

import assert              from 'assert';
import autobind            from 'autobind-decorator';

import {AC}                from '../actions';
import selectors           from '../state';
import SelCrit             from '../../shared/domain/SelCrit';
import itemTypes           from '../../shared/domain/itemTypes';

import Confirm             from './Confirm';
import EditSelCrit         from './EditSelCrit';

import AppBar              from 'material-ui/lib/app-bar';
import ArrowBackIcon       from 'material-ui/lib/svg-icons/navigation/arrow-back';
import Card                from 'material-ui/lib/card/card';
import CardText            from 'material-ui/lib/card/card-text';
import CardTitle           from 'material-ui/lib/card/card-title';
import ConfigIcon          from 'material-ui/lib/svg-icons/action/settings';
import IconButton          from 'material-ui/lib/icon-button';
import LeftNavMUI          from 'material-ui/lib/left-nav'; // NOTE: using LeftNavMUI because original Material UI component name (LeftNav) conflicts with ours
import MenuItem            from 'material-ui/lib/menus/menu-item';
import MoreVertIcon        from 'material-ui/lib/svg-icons/navigation/more-vert';
import colors              from 'material-ui/lib/styles/colors';


/**
 * GeekU LeftNav component.
 */

@ReactRedux.connect( (appState, ownProps) => {
  return {
    filters: selectors.getFilters(appState),
    appState,
  }
})

@autobind

export default class LeftNav extends React.Component {

  static propTypes = { // expected component props
  }

  constructor(props, context) {
    super(props, context);

    // keep track of our one-and-only instance
    assert(!_singleton, "<LeftNav> only ONE LeftNav is needed and therefore may be instantiated within the app.");
    _singleton = this;

    // define initial state controlling our display
    this.state = {
      open:     false,
      editMode: false
    };
  }

  /**
   * Open our one-and-only LeftNav ... a public access point.
   *
   * @public
   */
  static open() {
    // validate that an <LeftNav> has been instantiated
    assert(_singleton, "LeftNav.display() ... ERROR: NO <LeftNav> has been instantiated within the app.");

    // pass-through to our instance method
    _singleton.open();
  }

  open() {
    this.setState({
      open:     true,
      editMode: false
    });
  }

  handleVisible(open) {
    this.setState({open});
  }

  handleEditModeToggle() {
    this.setState({editMode: !this.state.editMode});
  }


  /**
   * Select the view to display the supplied selCrit.
   * 
   * @param {SelCrit -or- itemType-string} selCrit the selCrit to
   * select (in the view):
   *   - itemType-string: create/select a new selCrit of itemType
   *   - selCrit:         select the supplied selCrit
   */
  handleSelection(selCrit) {
    const p = this.props;

    // for selCrit object ... select it
    if (SelCrit.isSelCrit(selCrit)) {
      p.dispatch( AC.itemsView(selCrit.itemType, selCrit, 'activate') );
    }

    // for itemType-string ... create a new selCrit of the specified itemType (via edit) and select it
    else if (typeof selCrit === 'string') {
      const itemType = selCrit;
      assert(itemTypes[itemType], `LeftNav.handleSelection() INVALID itemType-string: ${FMT(itemType)}`);

      p.dispatch( AC.selCrit.edit(itemType) );
      // ??? figure out how to handle the variation PREVIOUSLY accomplished in CB:
      // ? EditSelCrit.edit(itemType, (newSelCrit) => {
      // ?   return AC.itemsView(itemType, newSelCrit, 'activate');
      // ? });
      // ??? currently acts correctly in LefNav Edit mode (does NOT activate it)
      // ??? needs to activate/retrieve in LeftNav Select mode
    }

    // invalid param
    else {
      throw new TypeError(`LeftNav.handleSelection() INVALID selCrit param: ${FMT(selCrit)}`);
    }

    // we always close our LeftNav
    this.setState({open: false})
  }


  /**
   * Edit the supplied selCrit.
   * 
   * @param {SelCrit} selCrit the selCrit to edit.
   */
  handleEdit(selCrit) {
    const p = this.props;

    // start an edit session with the supplied selCrit
    p.dispatch( AC.selCrit.edit(selCrit) );
    // ??? figure out how to handle the variation PREVIOUSLY accomplished in CB:
    // ? EditSelCrit.edit(selCrit, selCrit => {
    // ?   // on edit change ... SYNC view when using same selCrit
    // ?   return selectors.isSelCritActiveInView(p.appState, selCrit)
    // ?            ? AC.itemsView(selCrit.itemType, selCrit, 'no-activate')
    // ?            : null;
    // ? });
    // ??? currently acts correctly in LefNav Edit mode (refreshes when it is active, no refresh when not active, never takes down LeftNav)

  }


  /**
   * Save the supplied selCrit.
   * 
   * @param {SelCrit} selCrit the selCrit to save.
   */
  handleSave(selCrit) {
    const p = this.props;
    p.dispatch( AC.selCrit.save(selCrit) ) // SAVE selCrit
     .then( selCrit => {                   // SYNC view when using same selCrit
       if (selectors.isSelCritActiveInView(p.appState, selCrit)) {
         p.dispatch( AC.itemsView(selCrit.itemType, selCrit, 'no-activate') )
       }
     });
  }


  /**
   * Duplicate the supplied selCrit.
   * 
   * @param {SelCrit} selCrit the selCrit to duplicate.
   */
  handleDuplicate(selCrit) {
    const p = this.props;

    // duplicate ths supplied selCrit
    const dupSelCrit = SelCrit.duplicate(selCrit);

    // close our LeftNav
    this.setState({open: false});

    // start an edit session with this selCrit
    p.dispatch( AC.selCrit.edit(dupSelCrit) );
    // ??? figure out how to handle the variation PREVIOUSLY accomplished in CB:
    // ? EditSelCrit.edit(dupSelCrit, (changedDupSelCrit) => {
    // ?   return AC.itemsView(changedDupSelCrit.itemType, changedDupSelCrit, 'activate');
    // ? });
    // ??? currently NOT correct in LefNav Edit mode
    //     - should NOT take down LeftNav (? corrected from prior step - above)
    //     - should NOT activate (it correctly doesn't)
    //     - same bug where it doesn't retain when no changes because it doesn't think it has been modified)
  }


  /**
   * Delete the supplied selCrit.
   * 
   * @param {SelCrit} selCrit the selCrit to delete.
   */
  handleDelete(selCrit) {
    const p = this.props;

    Confirm.display({
      title: 'Delete Filter',
      msg:   `Please confirm deletion of filter: ${selCrit.name} -  ${selCrit.desc}`,
      actions: [
        { txt: 'Delete',
          action: () => {
            const impactView = selectors.isSelCritActiveInView(p.appState, selCrit) ? selCrit.itemType : null;
            if (SelCrit.isPersisted(selCrit)) { // is persised in DB
              p.dispatch( AC.selCrit.delete(selCrit, impactView) );
            }
            else { // is an in-memory only representation
              p.dispatch( AC.selCrit.delete.complete(selCrit, impactView) );
            }
          }
        },
        { txt: 'Cancel' },
      ]
    });
  }


  render() {
    const p = this.props;

    return (
      <LeftNavMUI docked={false}
                  open={this.state.open}
                  onRequestChange={this.handleVisible}>
      
        <AppBar title={this.state.editMode ? 'Configure Views' : 'Select View'}
                showMenuIconButton={false}
                iconElementRight={<IconButton onTouchTap={this.handleEditModeToggle}
                                              title={this.state.editMode ? 'go back to select view/filter' : 'change mode to configure view filters'}>
                                    {this.state.editMode ? <ArrowBackIcon/> : <ConfigIcon/>}
                                  </IconButton>}/>
      
        { itemTypes.meta.allTypes.map( (itemType) => {
      
          const selectedSelCrit = selectors.getItemsViewSelCrit(p.appState, itemType);

          return (
            <Card key={itemType} initiallyExpanded={false}>
            
              <CardTitle title={itemTypes.meta[itemType].label.plural}
                         titleStyle={{fontSize: 20}}
                         actAsExpander={true}
                         showExpandableButton={true}/>
            
              <CardText expandable={true}>
                { p.filters.map( (selCrit) => {
                    if (selCrit.itemType===itemType) {
                      const txt = SelCrit.isCurrentContentSaved(selCrit)
                                   ? selCrit.name
                                   : <span title="filter changes are NOT saved" style={{color: colors.deepOrangeA200, fontStyle: 'italic'}}>{selCrit.name}</span>;
                      if (this.state.editMode) {
                        return (
                          <MenuItem key={selCrit.key}
                                    primaryText={txt}
                                    insetChildren={true}
                                    checked={selectedSelCrit && selectedSelCrit.key===selCrit.key}
                                    rightIcon={<MoreVertIcon color={colors.grey700}/>}
                                    menuItems={[
                                      <MenuItem primaryText="Edit Filter"      onTouchTap={ () => this.handleEdit(selCrit) }/>,
                                      <MenuItem primaryText="Save Filter"      onTouchTap={ () => this.handleSave(selCrit) } disabled={SelCrit.isCurrentContentSaved(selCrit)}/>,
                                      <MenuItem primaryText="Duplicate Filter" onTouchTap={ () => this.handleDuplicate(selCrit) }/>,
                                      <MenuItem primaryText="Delete Filter"    onTouchTap={ () => this.handleDelete(selCrit) }/>,
                                    ]}/>
                        );
                      }
                      else {
                        return (
                          <MenuItem key={selCrit.key}
                                    primaryText={txt}
                                    insetChildren={true}
                                    checked={selectedSelCrit && selectedSelCrit.key===selCrit.key}
                                    onTouchTap={ () => this.handleSelection(selCrit)}/>
                        );
                      }
                    }
                    else {
                      return null;
                    }
                  })}
            
                <MenuItem primaryText={<i>... New Filter</i>} insetChildren={true} onTouchTap={ () => this.handleSelection(itemType)}/>
            
              </CardText>
            </Card>
          );
        })}
      
      </LeftNavMUI>
    );
  }
}

// our one-and-only instance
let _singleton = null;
