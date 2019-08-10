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
  async.series([
    db.addColumn.bind(db, 'users', 'is_admin', 'boolean'),
    db.runSql.bind(db, 'UPDATE users SET is_admin=true WHERE email=\'basic70@gmail.com\''),
  ], callback)
};

exports.down = function(db) {
  return db.removeColumn(db, 'users', 'is_admin');
};

exports._meta = {
  "version": 1
};
