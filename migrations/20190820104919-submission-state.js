'use strict';

var dbm;
var type;
var seed;

const async = require('async')

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  return async.series([
    db.addColumn.bind(db, 'submissions', 'final_state', {
      type: 'smallint',
      defaultValue: 0,
    }),
    db.addColumn.bind(db,  'submissions', 'tmp_state', 'string'),
  ], callback)
};

exports.down = function(db, callback) {
  return async.series([
    db.removeColumn.bind(db, 'submissions', 'final_state'),
    db.removeColumn.bind(db, 'submissions', 'tmp_state'),
  ], callback)
};

exports._meta = {
  "version": 1
};
