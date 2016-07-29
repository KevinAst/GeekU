'use strict';

import React              from 'react';
import ReduxUtil          from '../../util/ReduxUtil';

import autoBindAllMethods from '../../../shared/util/autoBindAllMethods';
import assert             from 'assert';
import {AC}               from '../../state/actions';

import AddCircleOutlineIcon    from 'material-ui/lib/svg-icons/content/add-circle-outline';
import RemoveCircleOutlineIcon from 'material-ui/lib/svg-icons/content/remove-circle-outline'; // replaced with standard 'x'
import IconButton              from 'material-ui/lib/icon-button';
import IconMenu                from 'material-ui/lib/menus/icon-menu';
import MenuItem                from 'material-ui/lib/menus/menu-item';
import Select                  from 'react-select'
import SelectField             from 'material-ui/lib/select-field';
import Table                   from 'material-ui/lib/table/table';
import TableBody               from 'material-ui/lib/table/table-body';
import TableRow                from 'material-ui/lib/table/table-row';
import TableRowColumn          from 'material-ui/lib/table/table-row-column';
import TextField               from 'material-ui/lib/text-field';

import colors                  from 'material-ui/lib/styles/colors';


/**
 * The SelCritDetail component provides an interactive editor for the
 * selCrit.filter data content.
 *
 * ??? AFTER REFACTORS, THESE STRUCTURES ARE IDENTICAL ... USE DIRECTLY FROM selCrit and obsolete editSelCrit.extra.filter
 * ? The editSelCrit.extra.filter contains an optimized structure for
 * ? the UI, that syncs to the persistent state
 * ? editSelCrit.selCrit.filter.  For example:
 * ? 
 * ?   appState.editSelCrit.selCrit.filter: [ // the master
 * ?     { field: "gender",     op: "EQ",  value: "F" },
 * ?     { field: "addr.state", op: "IN",  value: ["Missouri","Indiana"] },
 * ?     { field: "gpa",        op: "GTE", value: "3.65" }
 * ?   ]
 * ?  
 * ?   appState.editSelCrit.extra.filter: [  // temporal structure streamlining our UI components
 * ?     { "field": "gender",      "op": "EQ",   "value": "F" },
 * ?     { "field": "addr.state",  "op": "IN",   "value": ["Missouri","Indiana"] },
 * ?     { "field": "gpa",         "op": "GTE",  "value": "3.65" }
 * ?   ]
 */
const SelCritDetail = ReduxUtil.wrapCompWithInjectedProps(

  class SelCritDetail extends React.Component { // component definition

    constructor(props, context) {
      super(props, context);

      const p = this.props;

      assert(p.meta, "<SelCritDetail> meta property is required.");

      autoBindAllMethods(this);
    }


    /**
     * handleFilterChange()
     */
    handleFilterChange(extraFilter) {
      const p = this.props;
      p.dispatch( AC.selCrit.edit.filterChange(extraFilter) );
    }


    /**
     * handleOperatorChange()
     */
    handleOperatorChange(field, opValue) {
      const p = this.props;
      const newExtraFilter = p.extraFilter.map( (extraFilterObj) => {
        if (extraFilterObj.field === field) {
          return {...extraFilterObj, op: opValue};
        }
        else {
          return extraFilterObj;
        }
      });
      this.handleFilterChange(newExtraFilter);
    }


    /**
     * handleTextValueChange()
     */
    handleTextValueChange(field, txtValue) {
      const p = this.props;
      const newExtraFilter = p.extraFilter.map( (extraFilterObj) => {
        if (extraFilterObj.field === field) {
          return {...extraFilterObj, value: txtValue}; // prune options down to strictly the value strings
        }
        else {
          return extraFilterObj;
        }
      });
      this.handleFilterChange(newExtraFilter);
    }


    /**
     * handleSingleSelectValueChange()
     */
    handleSingleSelectValueChange(field, value) {
      const p = this.props;
      const newExtraFilter = p.extraFilter.map( (extraFilterObj) => {
        if (extraFilterObj.field === field) {
          return {...extraFilterObj, value: value}; // prune option down to strictly the value string
        }
        else {
          return extraFilterObj;
        }
      });
      this.handleFilterChange(newExtraFilter);
    }


    /**
     * handleMultiSelectValueChange()
     */
    handleMultiSelectValueChange(field, options) {
      const p = this.props;
      const newExtraFilter = p.extraFilter.map( (extraFilterObj) => {
        if (extraFilterObj.field === field) {
          return {...extraFilterObj, value: options.map( (option) => option.value)}; // prune options down to strictly the value strings
        }
        else {
          return extraFilterObj;
        }
      });
      this.handleFilterChange(newExtraFilter);
    }


    /**
     * handleAddFilter()
     */
    handleAddFilter(field) {
      const p = this.props;

      const metaSelCritField = p.meta.selCritFields[field];

      const initialOperator = {
        singleSelect:      'EQ',
        multiSelect:       'IN',
        multiSelectCreate: 'IN',
        comparison:        null, // require user selection (vs. '$eq')
      };

      const initialValue = {
        singleSelect:      '',
        multiSelect:       [],
        multiSelectCreate: [],
        comparison:        '',
      };

      const newExtraFilterObj = { field, op: initialOperator[metaSelCritField.type], value: initialValue[metaSelCritField.type]};

      const newExtraFilter    = [...p.extraFilter, newExtraFilterObj];

      this.handleFilterChange(newExtraFilter);
    }


    /**
     * handleDeleteFilter()
     */
    handleDeleteFilter(field) {
      const p = this.props;

      const indx           = p.extraFilter.findIndex( (filter) => filter.field === field );
      const newExtraFilter = [...p.extraFilter.slice(0,indx), ...p.extraFilter.slice(indx+1)];
      this.handleFilterChange(newExtraFilter);
    }


    /**
     * genFilterOperatorElm()
     */
    genFilterOperatorElm(extraFilterObj) {
      const p = this.props;

      const metaSelCritField = p.meta.selCritFields[extraFilterObj.field];

      switch (metaSelCritField.type) {

        case 'singleSelect':
          return 'matches';

        case 'multiSelect':
        case 'multiSelectCreate':
          return 'any of';

        case 'comparison':
          return (
            <SelectField value={extraFilterObj.op}
                         onChange={ (e, key, value) => this.handleOperatorChange(extraFilterObj.field, value) }
                         errorText={extraFilterObj.op ? null : 'operator is required'}
                         style={{width: '4em'}}
                         iconStyle={{fill: '#666'}}
                         hintText="operator">
              <MenuItem value="EQ"  primaryText="="/>
              <MenuItem value="GT"  primaryText=">"/>
              <MenuItem value="GTE" primaryText=">="/>
              <MenuItem value="LT"  primaryText="<"/>
              <MenuItem value="LTE" primaryText="<="/>
              <MenuItem value="NE"  primaryText="!="/>
            </SelectField>
          );

        default:
          return `UNSUPPORTED meta.selCritFields.type: '${metaSelCritField.type}' with value: ${extraFilterObj.value}`;
      }
    }


    /**
     * genFilterValueElm()
     */
    genFilterValueElm(extraFilterObj) {
      const p = this.props;

      const metaSelCritField = p.meta.selCritFields[extraFilterObj.field];

      switch (metaSelCritField.type) {

        case 'singleSelect':
          return (
            <SelectField value={extraFilterObj.value}
                         onChange={ (e, key, value) => this.handleSingleSelectValueChange(extraFilterObj.field, value) }
                         errorText={extraFilterObj.value ? null : 'value is required'}
                         autoWidth={true}
                         iconStyle={{fill: '#666'}}>
              { metaSelCritField.options.map( (option) => {
                  return <MenuItem key={option.value} value={option.value} primaryText={option.label}/>
                })}
            </SelectField>
          );

        case 'multiSelect':
          return <Select multi={true}
                         style={{width: '10em'}}
                         options={metaSelCritField.options}
                         value={extraFilterObj.value}
                         onChange={ (options) => this.handleMultiSelectValueChange(extraFilterObj.field, options) }
                         placeholder={<span style={{color: colors.red900}}>value is required</span>}
                         resetValue={[]}/>;

        case 'multiSelectCreate': // TODO: multiSelectCreate is NOT operational because allowCreate is NOT supported in react-select 1.0.0-beta (for now, don't use)
          return <Select multi={true}
                         allowCreate={true}
                         style={{width: '10em'}}
                         options={metaSelCritField.options}
                         value={extraFilterObj.value}
                         onChange={ (options) => this.handleMultiSelectValueChange(extraFilterObj.field, options) }
                         placeholder={<span style={{color: colors.red900}}>value is required</span>}
                         resetValue={[]}/>;

        case 'comparison':
          return <TextField style={{ width: '20em' }}
                            value={extraFilterObj.value}
                            onChange={ (e) => this.handleTextValueChange(extraFilterObj.field, e.target.value) }
                            errorText={extraFilterObj.value ? null : 'value is required'}/>;

        default:
          return `UNSUPPORTED meta.selCritFields.type: '${metaSelCritField.type}' with value: ${extraFilterObj.value}`;
      }
    }


    /**
     * render()
     */
    render() {
      const p = this.props;

      const metaSelCritFields = Object.keys(p.meta.selCritFields);

      return (
        <div style={{width: '100%'}}>
          <span style={{color: 'grey'}}>Selection Criteria:</span>
          <IconMenu iconButtonElement={ <IconButton title="Add new field to Selection Criteria">
                                          <AddCircleOutlineIcon color={colors.deepOrangeA200}/>
                                        </IconButton> }
                    targetOrigin={{vertical: 'top', horizontal: 'right', }}
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
            { metaSelCritFields.map( (field) => { // add MenuItem's for fields that are NOT already part of the filter
                return (p.extraFilter.find( (filter) => filter.field === field))
                       ? null
                       : <MenuItem key={field} 
                                   primaryText={p.meta.validFields[field]}
                                   onTouchTap={()=> this.handleAddFilter(field)}/>;
            })}
          </IconMenu>
          <br/>
          <Table height={'inherit'}
                 fixedHeader={false}
                 selectable={false}
                 multiSelectable={false}
                 style={{
                     width: 'auto', // ColWidth: HONORED at this level and changes table width (from 'fixed')
                   }}>
            <TableBody deselectOnClickaway={false}
                       displayRowCheckbox={false}
                       showRowHover={true}
                       stripedRows={false}>
              { p.extraFilter.map( (extraFilterObj) => {
                  return (
                    <TableRow key={extraFilterObj.field}>
                      <TableRowColumn>{p.meta.validFields[extraFilterObj.field]}</TableRowColumn>
                      <TableRowColumn>{this.genFilterOperatorElm(extraFilterObj)}</TableRowColumn>
                      <TableRowColumn>{this.genFilterValueElm(extraFilterObj)}</TableRowColumn>
                      <TableRowColumn>
                        <IconButton title="Remove field from Selection Criteria"
                                    onTouchTap={()=> this.handleDeleteFilter(extraFilterObj.field)}>
                          <RemoveCircleOutlineIcon color={colors.deepOrangeA200}/>
                        </IconButton>
                      </TableRowColumn>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      );
    }
  }, // end of ... component definition

  { // component property injection
    mapStateToProps(appState, ownProps) {
      return {
        extraFilter: appState.editSelCrit.extra.filter,
      };
    }
  }); // end of ... component property injection


// define expected props
SelCritDetail.propTypes = {
  meta: React.PropTypes.any.isRequired,
}

export default SelCritDetail;
