'use strict';

import term    from './term';
import subject from './subject';

/**
 * Promotes various meta data for the Students MongoDB collection.
 */

const studentsMeta = {

  // valid fields that make up the Students collection
  // ... from a validation perspective, a non-existent entry (fieldLabel of undefined)
  // ... a value of null (i.e. null fieldLabel) is NOT publically promoted in user-defined selCrit
  validFields: {
//  fieldName (DB):  fieldLabel (null for non-public)
    '_id':           null,
    'studentNum':    'Student Num',
    'gender':        'Gender',
    'firstName':     'First Name',
    'lastName':      'Last Name',
    'birthday':      'Birthday',
    'phone':         'Phone',
    'email':         'Email',
    'addr':          'Address',    // when addr only emitted, all sub-fields are included
    'addr.line1':    null,         // ... can emit individual sub-field (ex: 'addr.state': true)
    'addr.line2':    null,
    'addr.city':     null,
    'addr.state':    'From',
    'addr.zip':      'Zip',
    'gpa':           'GPA',
    'graduation':    'Graduation Term',
    'degree':        'Degree'
  },

  // default fields to display in a Students retrieval (a mongo projection)
  defaultDisplayFields: {
    '_id':         false,
    'studentNum':  true,
    'gender':      true,
    'firstName':   true,
    'lastName':    true,
    'birthday':    true,
    'gpa':         true,
    'graduation':  true,
    'degree':      true
  },

  // control structure driving interactive selCrit constraints
  selCritFields: {
    'gender':     {type: 'singleSelect', options: [{value: 'M', label: 'Male'}, {value: 'F', label: 'Female'}]},
    'firstName':  {type: 'comparison'},
    'lastName':   {type: 'comparison'},
    'birthday':   {type: 'comparison'},
    'phone':      {type: 'comparison'},
    'email':      {type: 'comparison'},
    'addr.state': {type: 'multiSelect',  options: genStateOptions()},
    'gpa':        {type: 'comparison'},
    'addr.zip':   {type: 'comparison'},
    'graduation': {type: 'multiSelect',  options: term.terms().map(       (term)    => { return {value: term,    label: term} })},
    'degree':     {type: 'multiSelect',  options: subject.subjects().map( (subject) => { return {value: subject, label: subject} })},
  },

};
export default studentsMeta;


function genStateOptions() {
  return [
    { value: 'Alabama',           label: 'Alabama' },
    { value: 'Alaska',            label: 'Alaska' },
    { value: 'Arizona',           label: 'Arizona' },
    { value: 'Arkansas',          label: 'Arkansas' },
    { value: 'California',        label: 'California' },
    { value: 'Colorado',          label: 'Colorado' },
    { value: 'Connecticut',       label: 'Connecticut' },
    { value: 'Delaware',          label: 'Delaware' },
    { value: 'Florida',           label: 'Florida' },
    { value: 'Georgia',           label: 'Georgia' },
    { value: 'Hawaii',            label: 'Hawaii' },
    { value: 'Idaho',             label: 'Idaho' },
    { value: 'Illinois',          label: 'Illinois' },
    { value: 'Indiana',           label: 'Indiana' },
    { value: 'Iowa',              label: 'Iowa' },
    { value: 'Kansas',            label: 'Kansas' },
    { value: 'Kentucky',          label: 'Kentucky' },
    { value: 'Louisiana',         label: 'Louisiana' },
    { value: 'Maine',             label: 'Maine' },
    { value: 'Maryland',          label: 'Maryland' },
    { value: 'Massachusetts',     label: 'Massachusetts' },
    { value: 'Michigan',          label: 'Michigan' },
    { value: 'Minnesota',         label: 'Minnesota' },
    { value: 'Mississippi',       label: 'Mississippi' },
    { value: 'Missouri',          label: 'Missouri' },
    { value: 'Montana',           label: 'Montana' },
    { value: 'Nebraska',          label: 'Nebraska' },
    { value: 'Nevada',            label: 'Nevada' },
    { value: 'New Hampshire',     label: 'New Hampshire' },
    { value: 'New Jersey',        label: 'New Jersey' },
    { value: 'New Mexico',        label: 'New Mexico' },
    { value: 'New York',          label: 'New York' },
    { value: 'North Carolina',    label: 'North Carolina' },
    { value: 'North Dakota',      label: 'North Dakota' },
    { value: 'Ohio',              label: 'Ohio' },
    { value: 'Oklahoma',          label: 'Oklahoma' },
    { value: 'Oregon',            label: 'Oregon' },
    { value: 'Pennsylvania',      label: 'Pennsylvania' },
    { value: 'Rhode Island',      label: 'Rhode Island' },
    { value: 'South Carolina',    label: 'South Carolina' },
    { value: 'South Dakota',      label: 'South Dakota' },
    { value: 'Tennessee',         label: 'Tennessee' },
    { value: 'Texas',             label: 'Texas' },
    { value: 'Utah',              label: 'Utah' },
    { value: 'Vermont',           label: 'Vermont' },
    { value: 'Virginia',          label: 'Virginia' },
    { value: 'Washington',        label: 'Washington' },
    { value: 'West Virginia',     label: 'West Virginia' },
    { value: 'Wisconsin',         label: 'Wisconsin' },
    { value: 'Wyoming',           label: 'Wyoming' },
  ];
}
