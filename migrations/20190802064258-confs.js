'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('confs', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    added_by_user_id: 'int',
    private_for_user_id: 'int',
    acronym: 'string',
    name: 'string',
    url: 'string',
    format: 'string',
    acceptance_rate: 'string',
  })
};

exports.down = function(db) {
  return db.dropTable('confs')
};

exports._meta = {
  "version": 1
};
