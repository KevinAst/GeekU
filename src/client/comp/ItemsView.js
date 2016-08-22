'use strict';

import React    from 'react';
import autobind from 'autobind-decorator';

import SelCrit            from '../../shared/util/SelCrit';

import {AC}               from '../actions';

import AppBar             from 'material-ui/lib/app-bar';
import Divider            from 'material-ui/lib/divider';
import FontIcon           from 'material-ui/lib/font-icon';
import IconButton         from 'material-ui/lib/icon-button';
import IconMenu           from 'material-ui/lib/menus/icon-menu';
import MenuItem           from 'material-ui/lib/menus/menu-item';
import MoreVertIcon       from 'material-ui/lib/svg-icons/navigation/more-vert';
import Paper              from 'material-ui/lib/paper';
import RefreshIndicator   from 'material-ui/lib/refresh-indicator';
import Table              from 'material-ui/lib/table/table';
import TableBody          from 'material-ui/lib/table/table-body';
import TableRow           from 'material-ui/lib/table/table-row';
import TableRowColumn     from 'material-ui/lib/table/table-row-column';

import colors             from 'material-ui/lib/styles/colors';

import EditSelCrit        from './EditSelCrit';
import Confirm            from './Confirm';



/**
 * The ItemsView base-class component implements the common features
 * of all view items display (i.e. students/courses).  
 * 
 * Because ItemsView is abstract, a concrete derivation must be
 * defined which provides the full implementation details for the
 * specific item type.  Please refer to DERIVATION-HOOK delimiter.
 */

@autobind

export default class ItemsView extends React.Component {

  static propTypes = { // expected component props

    dispatch:        React.PropTypes.func.isRequired,

    inProgress:      React.PropTypes.bool.isRequired,
    selCrit:         React.PropTypes.object.isRequired,

    items:           React.PropTypes.array.isRequired,
    selectedItem:    React.PropTypes.object.isRequired,
    itemsViewShown:  React.PropTypes.bool.isRequired,

    detailItem:      React.PropTypes.object.isRequired,
  }


  constructor(props, context) {
    super(props, context);

    // define our initial local component state
    this.state = { 
      hoveredItem: null,
    };
  }


  /**
   * Return the meta object describing the concrete item being displayed.
   *
   * DERIVATION-HOOK (abstract)
   */
  meta() {
    throw new TypeError("ERROR: ItemsView.meta() method is abstract and MUST be overridden in concrete derivations!");
  }


  /**
   * Handle changes to hoveredItem.
   * @param {Item} hoveredItem the item that is being hovered over (null for none).
   */
  handleHover(hoveredItem) {
    // optimize the number of setState() invocations
    // ... hover events happen in rapid succession
    // ... setState() is NOT guaranteed to be synchronous
    // ... utilize our own separate lastSetHoveredItem setting to:
    //     - KEY: reduce the number of setState() invocations by 50%
    if (hoveredItem !== this.lastSetHoveredItem) {
      this.lastSetHoveredItem = hoveredItem;
      this.setState({hoveredItem});
    }
  }


  /**
   * Handle view refresh request.
   */
  handleRefresh() {
    const p = this.props;
    p.dispatch( AC.itemsView(this.meta().itemType, 'refresh', 'no-activate') );
  }


  /**
   * Handle request to edit self's selCrit.
   */
  handleEditSelCrit() {
    const p = this.props;
    EditSelCrit.edit(p.selCrit, (changedSelCrit) => AC.itemsView(this.meta().itemType, changedSelCrit, 'no-activate'));
  }


  /**
   * Handle request to save self's selCrit.
   */
  handleSaveSelCrit() {
    const p = this.props;
    p.dispatch( AC.selCrit.save(p.selCrit) ) // SAVE selCrit
     .then( savedSelCrit => {                // SYNC our view
       p.dispatch( AC.itemsView(this.meta().itemType, savedSelCrit, 'no-activate') )
     });
  }


  /**
   * Handle request to create/use a new selCrit.
   */
  handleNewSelCrit() {
    // start an edit session requesting a new selCrit of specified itemType
    EditSelCrit.edit(this.meta().itemType, newSelCrit => AC.itemsView(this.meta().itemType, newSelCrit, 'no-activate'));
  }


  /**
   * Handle request to duplicate/edit/use self's selCrit.
   */
  handleDuplicateSelCrit() {
    const p = this.props;

    // duplicate our selCrit
    const dupSelCrit = SelCrit.duplicate(p.selCrit);

    // start an edit session with this dup selCrit
    EditSelCrit.edit(dupSelCrit, changedDupSelCrit => AC.itemsView(this.meta().itemType, changedDupSelCrit, 'no-activate'));
  }


  /**
   * Handle request to delete self's selCrit.
   */
  handleDeleteSelCrit() {
    const p = this.props;

    Confirm.display({
      title: 'Delete Filter',
      msg:   `Please confirm deletion of filter: ${p.selCrit.name} -  ${p.selCrit.desc}`,
      actions: [
        { txt: 'Delete',
          action: () => {
            const impactView = this.meta().itemType;
            if (SelCrit.isPersisted(p.selCrit)) { // is persised in DB
              p.dispatch( AC.selCrit.delete(p.selCrit, impactView) );
            }
            else { // is an in-memory only representation
              p.dispatch( AC.selCrit.delete.complete(p.selCrit, impactView) );
            }
          } },
        { txt: 'Cancel' },
      ]
    });

  }


  /**
   * Handle request to select the specified item.
   *
   * @param {Item} item the item to select
   */
  handleSelectItem(item) {
    const p = this.props;
    if (item) {
      p.dispatch( AC.selectItem(this.meta().itemType, item) );
    }
  }


  /**
   * Handle the "detail item dialog" request.
   *
   * @param {string} itemKey the key for the item to detail.
   * @param {boolean} editMode an indicator as to whether the item
   * dialog should start out in edit-mode (true) or view-mode (false).
   *
   * DERIVATION-HOOK (abstract)
   */
  handleDetailItemDialog(itemKey, editMode) {
    throw new TypeError("ERROR: ItemsView.handleDetailItemDialog() method is abstract and MUST be overridden in concrete derivations!");
  }


  /**
   * Provide a derivation hook to perform any preperation for the
   * overall render process.
   *
   * DERIVATION-HOOK (by default, does nothing)
   */
  renderPrep() {
  }


  /**
   * Provide a derivation hook to apply any item preperation for the
   * the renderField() process.
   *
   * @param {Item} item the item to prep.
   *
   * DERIVATION-HOOK (by default, does nothing)
   */
  renderItemPrep(item) {
  }


  /**
   * Render the supplied item/field in a <TableRowColumn> element.
   *
   * @param {Item} item the item record which the field resides.
   * @param {string} field the field name of the item to render.
   *
   * @return {TableRowColumn} the <TableRowColumn> element containing the rendered field (or null to display nothing)
   *
   * DERIVATION-HOOK (by default, simply display un-labeled field value)
   */
  renderField(item, field) {
    const rowCol = <TableRowColumn key={`${item[this.meta().keyField]}-${field}`}>{item[field]}</TableRowColumn>;
    return field===this.meta().keyField
             ? [rowCol, this.hoverControls]
             : rowCol;
  }


  /**
   * Render the Dialog element that manages the item-type detail.
   *
   * @return {Element}
   *
   * DERIVATION-HOOK (abstract)
   */
  renderDetailDialog() {
    throw new TypeError("ERROR: ItemsView.renderDetailDialog() method is abstract and MUST be overridden in concrete derivations!");
  }


  /**
   * Render the overall ItemsView.
   */
  render() {
    const p = this.props;

    const myStyle = {
      margin:    '15px auto', // 15px spacing top/bottom, center left/right
      textAlign: 'left',
      width:     '97%',       // ColWidth: HONORED (adding to inline <div> style),
      // 'auto' has NO impact
      // '90%' is honored
      // 'max-content'/'fit-content' works on chrome NOT IE
      // 'available' still big
      // ... can't even read/understand code: node_modules/material-ui/lib/paper.js
    };

    // we actually hide the ItemsView if NOT displayed as an attempted optimization for large list
    // ... one side-benefit is that we retain scrolling state from previous renderings
    //     TODO: doesn't seem to help - in fact it even takes longer to take it down ... hmmmm
    if (!p.itemsViewShown) {
      myStyle.display = 'none';
    }

    // derivation hook to prep for render
    this.renderPrep();

    // define the order that our columns are displayed (based on selCrit)
    const displayFieldOrder = p.selCrit.fields && p.selCrit.fields.length > 0
            ? p.selCrit.fields
            : Object.keys(this.meta().defaultDisplayFields); // default found in meta obj


    // setup control structures supporting a visual break when values from the major-sort field changes
    const sortFields = (p.selCrit.sort || []).map( sortField => sortField.charAt(0)==='-' ? sortField.substr(1) : sortField );
    let   curMajorSortValue, lastMajorSortValue = null;
    const majorSortField = sortFields[0];

    const selCritName = SelCrit.isCurrentContentSaved(p.selCrit)
                         ? p.selCrit.name
                         : <span title="filter changes are NOT saved" style={{color: colors.deepOrangeA200, fontStyle: 'italic'}}>{p.selCrit.name}</span>;

    const selCritActionEnabled = p.selCrit.key ? true : false;

    return <Paper className="app-content"
                  style={myStyle}
                  zDepth={4}>

      <Paper className="page"
             style={{
               textAlign: 'left',
               width:     '100%',
             }}
             zDepth={1}>

        <AppBar className="page-header"
                style={{
                  backgroundColor: colors.blueGrey700, // also like lime900
                }}
                title={<span>
                         <i>{this.meta().label.plural}</i>
                         {p.inProgress && refreshInd}
                         <i style={{fontSize: 12}}>&nbsp;&nbsp;&nbsp;&nbsp; {selCritName}: {p.selCrit.desc}</i>
                       </span>}
                iconElementLeft={<i/>}
                iconElementRight={
                  <IconMenu iconButtonElement={ <IconButton><MoreVertIcon/></IconButton> }
                            targetOrigin={{vertical: 'top', horizontal: 'right', }}
                            anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                    <MenuItem primaryText="Edit Filter"      onTouchTap={this.handleEditSelCrit}      disabled={!selCritActionEnabled}/>
                    <MenuItem primaryText="Save Filter"      onTouchTap={this.handleSaveSelCrit}      disabled={SelCrit.isCurrentContentSaved(p.selCrit)}/>
                    <MenuItem primaryText="New Filter"       onTouchTap={this.handleNewSelCrit}/>
                    <MenuItem primaryText="Duplicate Filter" onTouchTap={this.handleDuplicateSelCrit} disabled={!selCritActionEnabled}/>
                    <MenuItem primaryText="Delete Filter"    onTouchTap={this.handleDeleteSelCrit}    disabled={!selCritActionEnabled}/>
                    <Divider/>
                    <MenuItem primaryText="Refresh View"     onTouchTap={this.handleRefresh}          disabled={p.selCrit.key ? false : true}/>
                  </IconMenu>}/>

        <Table className="page-content"
               height={'inherit'}
               fixedHeader={false}
               selectable={true}
               multiSelectable={false}
               onRowSelection={(selectedRows)=>this.handleSelectItem(selectedRows.length===0 ? null : p.items[selectedRows[0]])}
               onRowHover={(rowNum)=> this.handleHover(p.items[rowNum])}
               onRowHoverExit={(rowNum)=> this.handleHover(null)}
               style={{
                   width: 'auto', // ColWidth: HONORED at this level and changes table width (from 'fixed')
                 }}>
          <TableBody deselectOnClickaway={false}
                     displayRowCheckbox={false}
                     showRowHover={true}
                     stripedRows={false}>

            { p.items.map( (item, itemIndx) => {


                // NOTE: item keys are always emitted (enforced by server)

                if (itemIndx > 100) { // TODO: ?? temporally narrow entries till we figure out how to handle big lists or make them unneeded
                  return '';
                }

                // derivation hook to prep for render of item
                this.renderItemPrep(item);


                // define the control buttons to use when row is 'hovered' over
                this.hoverControls = <TableRowColumn key={`${item[this.meta().keyField]}-hoverControls`}>
                                       <i style={{
                                            cursor:     'pointer',
                                            // ... we explicitly use visibility to take space even when hidden, so as to NOT be "jumpy"
                                            visibility: this.state.hoveredItem===item ? 'visible' : 'hidden',
                                          }}>
                                         <FontIcon className="material-icons" color={colors.grey700} onClick={()=>this.handleDetailItemDialog(item[this.meta().keyField], false)}>portrait</FontIcon>
                                         <FontIcon className="material-icons" color={colors.red900}  onClick={()=>this.handleDetailItemDialog(item[this.meta().keyField], true)}>edit</FontIcon>
                                       </i>
                                     </TableRowColumn>;


                // provide a visual break when the major-sort field changes
                curMajorSortValue = majorSortField ? item[majorSortField] : null;
                const majorSortBreakStyle = p.selCrit.distinguishMajorSortField && curMajorSortValue !== lastMajorSortValue && itemIndx !== 0
                                              ? {borderTop: '2px solid'}
                                              : {};
                lastMajorSortValue = curMajorSortValue;
                
                return (
                  <TableRow key={item[this.meta().keyField]}
                            style={majorSortBreakStyle}
                            selected={item===p.selectedItem}>

                    { displayFieldOrder.map( (field) => { // columns are ordered based on the definition in selCrit
                         return this.renderField(item, field);
                      })}

                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Paper>
      { p.detailItem && this.renderDetailDialog() }
    </Paper>
  }
}

 
// NOTE: Our retrieval is SO FAST, I am using a determinate mode because the animation is starting so small there is no time to see it
// NOTE: <CircularProgress> is VERY HOAKY ... insists on 50px by 50px outer rectangle (NO WAY TO DECREASE)
//       <CircularProgress size={0.3} color={colors.white}/> : <i/>;
// NOTE: <RefreshIndicator> is NOT MUCH BETTER ... any size under 50 has mucho transformation problems
const refreshInd = <RefreshIndicator size={50}
                                     top={10}
                                     left={60}
                                     percentage={80}
                                     color={"red"}
                                     status="ready"
                                     style={{display:  'inline-block',
                                             position: 'relative'}}/>
