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
  return db.createTable('notes', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    private: 'boolean',
    user_id: 'int',
    conf_id: 'int',
    instance_id: 'int',
    track_id: 'int',
    note: 'string',
  })
};

exports.down = function(db) {
  return db.dropTable('notes')
};

exports._meta = {
  "version": 1
};
