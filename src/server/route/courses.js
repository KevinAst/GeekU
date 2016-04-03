'use strict';

import Log            from '../../shared/util/Log';
import express        from 'express';
import coursesMeta    from '../../shared/model/coursesMeta';
import * as MongoUtil from '../util/MongoUtil';




// ??? initial log testing
Log.applyFilter({
  'courses.js':  Log.DEBUG,
  'students.js': Log.ERROR
});

const logCourses = new Log('courses.js');
logCourses.fatal( ()=>'Probe 1a TEST Object', logCourses);
logCourses.error( ()=>'Probe 2a TEST Date', new Date());
logCourses.warn(  ()=>'Probe 3a');
logCourses.info(  ()=>'Probe 4a');
logCourses.debug( ()=>'Probe 5a');
logCourses.trace( ()=>'Probe 6a');

// Log.allowErrorToVetoProbeEmission = false; // ??? VERY TEMP

const logStudents = new Log('students.js');
logStudents.fatal( ()=>'Probe 1a TEST Error', new Error('test error logging'));
logStudents.error( ()=>'Probe 2a TEST Error declining log', new Error('test error logging').setCause(Error.Cause.RECOGNIZED_CLIENT_ERROR));
logStudents.warn(  ()=>'Probe 3a');
logStudents.info(  ()=>'Probe 4a');
logStudents.debug( ()=>'Probe 5a');
logStudents.trace( ()=>'Probe 6a');






const courses = express.Router();


//***************************************************************************************************
//*** retrieve a list of courses: /api/courses[? fields=f1,f2,f3 & filter={mongoQuery}]
//***
//***   - use optional "fields" query string to fine tune fields to emit
//***     * specify comma delimited list of field names
//***       ... see: coursesMeta.validFields for valid field names
//***     * DEFAULT: coursesMeta.defaultDisplayFields will be emitted
//***
//***   - use optional "filter" query string to supply selection criteria
//***     * specify a JSON structure conforming to the MongoDB query structure
//***       ... see: https://docs.mongodb.org/manual/tutorial/query-documents/
//***       ... ex:  /api/courses?filter={"_id":{"$in":["CS-1110","CS-1112"]}}
//***                ... returns info from two courses (CS-1110 and CS-1112)
//***       ... ex:  /api/courses?filter={"subjDesc":"Applied & Engineering Physics"}
//***                ... returns courses from the "Applied & Engineering Physics" field of study
//***                    NOTE: always protect data (like the "&" above) by using UrlEncode()
//***     * DEFAULT: return ALL courses
//***
//***************************************************************************************************

courses.get('/api/courses', (req, res, next) => {
  console.log(`INFO: courses.js processing request: ${decodeURIComponent(req.originalUrl)}`);

  // define our fields to display (a mongo projection) 
  // tweaked from the optional client-supplied "fields" query string
  // ... ex: /api/courses?fields=a,b,c
  const displayFields = MongoUtil.mongoFields(coursesMeta.validFields,
                                              coursesMeta.defaultDisplayFields,
                                              req.query.fields);

  // define our mongo query object
  // tweaked from the optional client-supplied "query" query string
  // ... ex: /api/courses?filter={"_id":{"$in":["CS-1110","CS-1112"]}}
  const mongoQuery = MongoUtil.mongoQuery(req.query.filter);

  // perform retrieval
  const coursesColl = req.geekU.db.collection('Courses');
  coursesColl.find(mongoQuery, displayFields)
  .toArray()
  .then( courses => {
    res.geekU.send(courses);
  })
  .catch( err => {
    // NOTE: unsure if we ALWAYS want to cover up technical message
    //       ... it may be due to bad interpretation of mongoQuery
    throw err.setClientMsg("Issue encountered in DB processing of /api/courses");
  });
});



//******************************************************************************
//*** retrieve a course detail (with enrollment): /api/courses/:courseNum
//***   - when courseNum is Not Found, a 404 status is returned (Not Found)
//******************************************************************************

courses.get('/api/courses/:courseNum', (req, res, next) => {
  console.log(`INFO: courses.js processing request: ${decodeURIComponent(req.originalUrl)}`);

  const courseNum = req.params.courseNum;

  // perform retrieval
  const coursesColl = req.geekU.db.collection('Courses');
  coursesColl.aggregate([
    { $match: {_id: courseNum} },
    { $lookup: {
        from:         "Enrollment",
        localField:   "courseNum",
        foreignField: "course.courseNum",
        as:           "enrollment" } },
    { $project: {
      _id: false,
      "courseNum":     true,
      "courseTitle":   true,
      "courseDesc":    true,
      "academicGroup": true,
      "subjDesc":      true,
      "enrollment.term":    true,
      "enrollment.grade":   true,
      "enrollment.student": true } }
  ])
  .toArray()
  .then( courses => {
    if (courses.length === 0) {
      res.geekU.sendNotFound();
    }
    else {
      res.geekU.send(courses[0]);
    }
  })
  .catch( err => {
    throw err.setClientMsg("Issue encountered in DB processing of /api/courses/:courseNum");
  });

});


export default courses;
