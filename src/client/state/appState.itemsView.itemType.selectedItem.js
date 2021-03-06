import actions        from '../actions';
import {reducerHash}  from 'astx-redux-util';
import itemTypes      from '../../shared/domain/itemTypes';
import Log            from '../../shared/util/Log';

// ***
// *** appState.itemsView.itemType.selectedItem reducer (function wrapper)
// ***

// NOTE: This module promotes a reducer function wrapper (with
//       _itemType state), which in turn returns the reducer function.

export default function selectedItem(_itemType) {

  const log = new Log(`appState.itemsView.${_itemType}.selectedItem`);

  return reducerHash.withLogging(log, {

    [actions.selectItem](selectedItem, action) {
      return [
        action.item,
        ()=>`set selectedItem from action.item: ${FMT(action.item)}`
      ];
    },
    
    [actions.itemsView.retrieve.complete] (selectedItem, action) {
      // TODO: we could keep the selected item, if it is contained in the new retrieval (action.items)
      return [
        null,
        ()=>'de-selecting selectedItem on new retrieval'
      ];
    },
    
    [actions.detailItem.retrieve.complete](selectedItem, action) {
      // NOTE: currently NO need to check if item retrieved is same (itemNum) as what is selected
      //       because activating the detailItem dialog also selects it
      return [
        action.item,
        ()=>'sync selectedItem from action.item ... ' + FMT(action.item)
      ];
    },
    
    [actions.selCrit.delete.complete](selectedItem, action) {
      // sync when our view has been impacted by selCrit deletion
      if (action.impactView===_itemType) {
        return [
          null,
          ()=>'clear selectedItem becase our view is based on deleted selCrit'
        ];
      }
      // no-sync when our view is not impacted by selCrit deletion
      else {
        return [
          selectedItem,
          ()=>'no change to selectedItem because our view is NOT based on deleted selCrit'
        ];
      }
    },

  }, null); // initialState

}


//***
//*** Selectors ...
//***

export const getItemsViewSelectedItem = (selectedItem) => selectedItem;
