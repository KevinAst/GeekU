'use strict';

/**
 * Promotes various MongoDB utilities.
 */

// return a Mongo projection object, defining the fields to promote.
// PARAMS:
// - validFields:    valid fields for the desired collection
// - defaultFields:  the default fields to display (when NO reqQueryFields is supplied)
// - reqQueryFields: an optional http request query string parameter enumerating the fields to display
//                   ... ex: http://localhost:8080/api/courses?fields=a,b,c
export function mongoFields(validFields, defaultFields, reqQueryFields) {

  // when NO reqQueryFields have been supplied, simply use the supplied default
  if (!reqQueryFields) {
    return defaultFields;
  }

  // build up our projection from reqQueryFields
  const projection = {};
  const fields = reqQueryFields.split(',');
  for (let field of fields) {
    field = field.trim();
    if (!validFields[field]) {
      const msg = `Invalid field ('${field}') specified in request query field parameter: '${reqQueryFields}'`
      throw new Error(msg).setClientMsg(msg)
                          .setCause(Error.Cause.RECOGNIZED_CLIENT_ERROR);
    }
    projection[field] = true;
  }

  // when NO _id has been requested to display, we must explicity turn it off (a mongo heuristic)
  if (!projection._id) {
    projection._id = false;
  }

  // that's all folks
  return projection
}


// return a Mongo query object, defining the selection criteria for a collection.
// PARAMS:
// - reqQueryFilter: an optional http request query string parameter (a string) containing the json query object
//                   ... ex: /api/courses?filter={"_id":{"$in":["CS-1110","CS-1112"]}}
export function mongoQuery(reqQueryFilter) {

  // default to return all documents in collection
  let mongoQuery = {};

  // when supplied, refine with client-supplied query (a string)
  if (reqQueryFilter) {
    const filter = decodeURIComponent(reqQueryFilter);
    try {
      mongoQuery = JSON.parse(filter);
    }
    catch(e) {
      throw e.setClientMsg(`Invalid request query filter: '${filter}' ... ${e.message}`)
             .setCause(Error.Cause.RECOGNIZED_CLIENT_ERROR);
    }
  }

  // that's all folks
  return mongoQuery;
}