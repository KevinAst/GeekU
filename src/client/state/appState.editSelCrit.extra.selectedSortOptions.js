'use strict'

import {AT}             from '../actions';
import ReductionHandler from '../util/ReductionHandler';
import itemTypes        from '../../shared/domain/itemTypes';


// ***
// *** appState.editSelCrit.extra.selectedSortOptions reducer
// ***

const reductionHandler = new ReductionHandler('appState.editSelCrit.extra.selectedSortOptions', {

  [AT.selCrit.edit](selectedSortOptions, action) {

    // convert selCrit.sort to selectedSortOptions
    const meta                   = itemTypes.meta[action.selCrit.itemType];
    const newSelectedSortOptions = (action.selCrit.sort || []).map( field => {
      const ascDec = field.charAt(0) === '-' ? -1 : +1;
      if (ascDec === -1) {
        field = field.substr(1); // strip first char (a negative sign "-xxx")
      }
      return {
        value:  field,
        label:  meta.validFields[field],
        ascDec
      };
    });

    return [
      newSelectedSortOptions,
      ()=>`convert selCrit.sort to selectedSortOptions: ${FMT(newSelectedSortOptions)}`
    ];
  },

  [AT.selCrit.edit.change.sort](selectedSortOptions, action) {
    return [
      action.selectedSortOptions,
      ()=>`set selectedSortOptions from action.selectedSortOptions: ${FMT(action.selectedSortOptions)}`
    ];
  },

});

export default function selectedSortOptions(selectedSortOptions=[], action) {
  return reductionHandler.reduce(selectedSortOptions, action);
}
