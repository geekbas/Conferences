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
    db.removeColumn.bind(db, 'confs', 'private_for_user_id'),
    db.removeColumn.bind(db, 'instances', 'private_for_user_id'),
    db.removeColumn.bind(db, 'tracks', 'private_for_user_id'),
  ], callback)
};

exports.down = function(db, callback) {
  return async.series([
    db.addColumn.bind(db, 'confs', 'private_for_user_id', 'int'),
    db.addColumn.bind(db, 'instances', 'private_for_user_id', 'int'),
    db.addColumn.bind(db, 'tracks', 'private_for_user_id', 'int'),
  ], callback)
};

exports._meta = {
  "version": 1
};
