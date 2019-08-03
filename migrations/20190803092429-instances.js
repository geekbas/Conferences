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
  return db.createTable('instances', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    conf_id: 'int', // TODO: foreign key
    added_by_user_id: 'int',
    private_for_user_id: 'int',
    url: 'string',
    year: 'string',
    // dates later
  })
};

exports.down = function(db) {
  return db.dropTable('instances')
};

exports._meta = {
  "version": 1
};
