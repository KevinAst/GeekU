'use strict';

import express        from 'express';
import itemTypes      from '../../shared/domain/itemTypes';
import * as MongoUtil from '../util/MongoUtil';

const students = express.Router();


//***************************************************************************************************
//*** retrieve a list of students: /api/students[?query-string ... see below]
//***
//***   - by default, all students will be retrieved, in random order, emitting fields defined in
//***     meta.defaultDisplayFields.
//***
//***   - use optional "selCrit" query-string to fine tune retrieval/sort functionality.
//***
//***     This is a common structure for ALL DB retrievals
//***      ... see: src/client/state/appState.md for details
//***
//***     NOTE: Client's should always protect the data (above) by using the
//***           encodeJsonQueryStr(queryName, jsonObj) utility.
//***           ... src/shared/util/QueryStrUtil.js
//***
//***************************************************************************************************

students.get('/api/students', (req, res, next) => {

  // define our optional top-level selCrit from the request object
  const selCrit = MongoUtil.selCrit(req, itemTypes.meta.student);

  // force studentNum to always be emitted
  if (!selCrit.mongoFields.studentNum) {
    selCrit.mongoFields.studentNum = true;
  }

  // perform retrieval
  const studentsColl = req.geekU.db.collection('Students');
  studentsColl.find(selCrit.mongoFilter, selCrit.mongoFields)
              .sort(selCrit.mongoSort)
              .toArray()
              .then( students => {
                res.geekU.send(students);
              })
              .catch( err => {
                // communicate error ... sendError() will also log as needed
                res.geekU.sendError(err.defineClientMsg("Issue encountered in DB processing of /api/students"),
                                    req);
              });
});



//******************************************************************************
//*** retrieve a student detail (with enrollment): /api/students/:studentNum
//***   - when studentNum is Not Found, a 404 status is returned (Not Found)
//******************************************************************************

students.get('/api/students/:studentNum', (req, res, next) => {

  const studentNum = req.params.studentNum;

  // perform retrieval
  const studentsColl = req.geekU.db.collection('Students');
  studentsColl.aggregate([
    { $match: {_id: studentNum} },
    { $lookup: {
      from:         "Enrollment",
      localField:   "studentNum",
      foreignField: "student.studentNum",
      as:           "enrollment" } },
    { $project: {
      _id: false,
	    "studentNum": true,
	    "gender":     true,
	    "firstName":  true,
	    "lastName":   true,
	    "birthday":   true,
	    "phone":      true,
	    "email":      true,
	    "addr":       true,
	    "gpa":        true,
      'graduation': true,
	    "degree":     true,
      "enrollment.term":   true,
      "enrollment.grade":  true,
      "enrollment.course": true } }
  ])
  .toArray()
  .then( students => {
    if (students.length === 0) {
      res.geekU.sendNotFound();
    }
    else {
      res.geekU.send(students[0]);
    }
  })
  .catch( err => {
    // communicate error ... sendError() will also log as needed
    res.geekU.sendError(err.defineClientMsg("Issue encountered in DB processing of /api/students/:studentNum"),
                        req);
  });

});


export default students;
