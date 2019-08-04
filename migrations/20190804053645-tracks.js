'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = function(db) {
  return db.createTable('tracks', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    instance_id: 'int', // ref
    added_by_user_id: 'int',
    private_for_user_id: 'int',
    name: 'string',
    url: 'string',
    page_limit: 'int',
    including_references: 'boolean',
    double_blind: 'boolean',
  })
}

exports.down = function(db) {
  return db.dropTable('tracks')
}

exports._meta = {
  "version": 1
}
