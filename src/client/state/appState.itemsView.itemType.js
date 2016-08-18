'use strict'

import * as Redux from 'redux';

import selectedItem    from './appState.itemsView.itemType.selectedItem';
import detailItem      from './appState.itemsView.itemType.detailItem';
import detailEditMode  from './appState.itemsView.itemType.detailEditMode';
import inProgress      from './appState.itemsView.itemType.inProgress';
import selCrit         from './appState.itemsView.itemType.selCrit';
import items           from './appState.itemsView.itemType.items';

// ***
// *** appState.itemsView.itemType reducer (function wrapper)
// ***

// NOTE: This module promotes a reducer function wrapper (with
//       _itemType state), which in turn returns the reducer function.

export default function itemType(_itemType) {

  const combineReducers = Redux.combineReducers({

    selectedItem:   selectedItem(_itemType),

    detailItem:     detailItem(_itemType),
    detailEditMode: detailEditMode(_itemType),

    inProgress:     inProgress(_itemType),
    selCrit:        selCrit(_itemType),
    items:          items(_itemType),

  });

  return function itemType(itemType={}, action) {

    // NOTE: Our itemType reducers are used in multiple branches of our state tree.
    //       - In support of this, we must instantiate our reducer functions with state (_itemType).
    //       - These itemType reducers should ONLY respond to actions that contain a consistent itemType!
    //         * This is accomplished through the conditional logic (below)
    //         * This short-circuits the process early-on, so we don't have to 
    //           repeatedly check in each of our subordinate reducers!
    return (!action.itemType || action.itemType === _itemType)
             ? combineReducers(itemType, action)
             : itemType;
  }

}
