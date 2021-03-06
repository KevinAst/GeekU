
<br/><br/><br/>

<a id="detailItem"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  detailItem() : app-node</h5>
Actions rooted in 'detailItem' (item detailed in visual dialog).


Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


<br/><br/><br/>

<a id="detailItem"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  detailItem(itemType, itemNum, editMode) ⇒ Action</h5>
Activate a dialog detailing (and/or editing) the supplied item.An up-to-date item image is retrieved prior to it's display.

**Intent**: #byUser, #reducer(spinner only)  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| itemType | string | the itemType ('student'/'course'). |
| itemNum | string | the item number to detail (studentNum/courseNum). |
| editMode | boolean | an indicator as to wheter the dialog starts out in read-only (false) or edit-mode (true). |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="filters"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  filters() : app-node</h5>
Actions rooted in 'filters' (i.e. selCrit objects).


Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


<br/><br/><br/>

<a id="filters_retrieve"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  filters.retrieve() ⇒ Action</h5>
Retrieve filters ... a list of selCrit objects.

**Intent**: #byLogic, #reducer(spinner only)  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


<br/><br/><br/>

<a id="itemsView"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  itemsView() : app-node</h5>
Actions rooted in 'itemsView' (items in view).


Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


<br/><br/><br/>

<a id="itemsView"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  itemsView(itemType, [retrieve], [activate]) ⇒ Action</h5>
Retrieve and/or activate the itemsView for the specifieditemType.  Use this action when you wish to do BOTHretrieve/activate.

**Intent**: #byUser, #noReducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Default | Description |
| --- | --- | --- | --- |
| itemType | string |  | the itemType ('student'/'course'). |
| [retrieve] | any | <code>.null</code> | the retrieval directive, one of: <ul>   <li> null:        no retrieval at all (DEFAULT)</li>   <li> SelCrit:     conditionally retrieve items when supplied selCrit is different (or out-of-date) from ItemsView selCrit</li>   <li> 'refresh':   unconditionally refresh ItemsView with latest items (using view's current selCrit)</li> </ul> |
| [activate] | string | <code>&quot;see desc&quot;</code> | an activate directive, one of: <ul>   <li> 'activate':    activate/visualize this itemType ItemsView (DEFAULT for all but 'refresh' retrieval)</li>   <li> 'no-activate': DO NOT activate                            (DEFAULT for 'refresh' retrieval)</li> </ul> |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="itemsView_retrieve"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  itemsView.retrieve(itemType, selCrit) ⇒ Action</h5>
Retrieve the Items View for the specified itemType.

**Intent**: #byUser, #byLogic, #reducer(spinner only)  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| itemType | string | the itemType ('student'/'course'). |
| selCrit | any | the selCrit driving the retrieval, one of: <ul>   <li>SelCrit:   conditionally retrieve items when supplied selCrit is different (or out-of-date) from ItemsView selCrit</li>   <li>'refresh': unconditionally refresh ItemsView with latest items (using view's current selCrit)</li> </ul> |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="itemsView_retrieve.complete"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  itemsView.retrieve.complete(itemType, selCrit, items) ⇒ Action</h5>
Retrieval completed of items for the Items View.

**Intent**: #byLogic, #reducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| itemType | string | the itemType ('student'/'course'). |
| selCrit | any | the selCrit driving the retrieval, one of: <ul>   <li>SelCrit:     conditionally retrieve items when supplied selCrit is different (or out-of-date) from ItemsView selCrit</li>   <li>'refresh':   unconditionally refresh ItemsView with latest items (using view's current selCrit)</li> </ul> |
| items | Array.&lt;Item&gt; | the items retrieved. |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="itemsView_retrieve.fail"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  itemsView.retrieve.fail(itemType, selCrit, error) ⇒ Action</h5>
Retrieval failed of items for the Items View.

**Intent**: #byLogic, #reducer(spinner only)  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| itemType | string | the itemType ('student'/'course'). |
| selCrit | any | the selCrit driving the retrieval, one of: <ul>   <li>SelCrit:     conditionally retrieve items when supplied selCrit is different (or out-of-date) from ItemsView selCrit</li>   <li>'refresh':   unconditionally refresh ItemsView with latest items (using view's current selCrit)</li> </ul> |
| error | Error | the Error detailing the failure. |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="itemsView_activate"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  itemsView.activate(itemType) ⇒ Action</h5>
Activate the Items View for the specified itemType.

**Intent**: #byUser, #byLogic, #reducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| itemType | string | the itemType ('student'/'course'). |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="selCrit"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  selCrit() : app-node</h5>
Actions rooted in 'selCrit' (selection criteria).


Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


<br/><br/><br/>

<a id="selCrit_edit"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  selCrit.edit(selCrit, isNew, syncDirective) ⇒ Action</h5>
Start an edit dialog session of the supplied selCrit.

**Intent**: #byUser, #reducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| selCrit | SelCrit | the selCrit to edit. |
| isNew | boolean | indicator as to whether the supplied selCrit is new (true), or previously existed (false) ... DEFAULT: false |
| syncDirective | SelCrit.SyncDirective | a directive that indicates how selCrit changes should be synced in selCrit-based views ... DEFAULT: SelCrit.SyncDirective.default |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="selCrit_changed"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  selCrit.changed(selCrit, syncDirective) ⇒ Action</h5>
A central notification that the supplied selCrit has changed (andis in a completed/valid state).This is emitted by various logic points under any circumstance ofa completed/valid change (ex: edit dialog completion, save,etc.), and is of interest to reducers to to maintain overallstate.

**Intent**: #byLogic, #reducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| selCrit | SelCrit | the selCrit that has changed. |
| syncDirective | SelCrit.SyncDirective | a directive that indicates how selCrit changes should be synced in selCrit-based views. ... DEFAULT: SelCrit.SyncDirective.default |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="selCrit_save"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  selCrit.save(selCrit, syncDirective) ⇒ Action</h5>
Save the supplied selCrit.Any view that is based on this selCrit is automatically updated.

**Intent**: #byUser, #byLogic, #reducer(spinner only)  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| selCrit | SelCrit | the selCrit to save. |
| syncDirective | SelCrit.SyncDirective | a directive that indicates how selCrit changes should be synced in selCrit-based views. ... DEFAULT: SyncDirective.default |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="selCrit_delete"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  selCrit.delete(selCrit) ⇒ Action</h5>
Delete the supplied selCrit, after obtaining a user confirmation.Any view that is based on this selCrit is automatically updated (see impactView).

**Intent**: #byUser, #reducer(spinner only)  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| selCrit | SelCrit | the selCrit to delete.  This can either be a local in-memory representation -or- on persisted in the DB. |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="selectItem"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  selectItem() : app-node</h5>
Actions rooted in 'selectItem' (the selected item).


Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


<br/><br/><br/>

<a id="selectItem"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  selectItem(itemType, item) ⇒ Action</h5>
Select an item within an itemsView.

**Intent**: #byUser, #byLogic, #reducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| itemType | string | the itemType ('student'/'course'). |
| item | any | the item to select (null for de-select) |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="userMsg"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  userMsg() : app-node</h5>
Actions rooted in 'userMsg' (user notifications).


Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


<br/><br/><br/>

<a id="userMsg_display"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  userMsg.display(msg, userAction) ⇒ Action</h5>
Display a user message via Material UI Snackbar.NOTE: An alternate technique to activate a user message is through      the static UserMsg.display(msg [, userAction]) method.  This      may be preferred when you have no access to the dispatcher.

**Intent**: #byUser, #byLogic, #reducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.


| Traits | Type | Description |
| --- | --- | --- |
| msg | string | the message to display. |
| userAction | Obj | an optional structure defining a user click action:                {                  txt:      'your-button-label-here',                  callback: function(event) {                    code-executed-on-button-click                  }                } |

*The **Traits** column (above) represents both Action Creator function parameters **and** Action Properties.*


<br/><br/><br/>

<a id="userMsg_close"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  userMsg.close() ⇒ Action</h5>
Close the user message dialog.

**Intent**: #byLogic, #reducer  

Note that the **Action Type** is promoted through a string coercion of the action creator itself *(i.e. it's toString() has been overloaded)*.

