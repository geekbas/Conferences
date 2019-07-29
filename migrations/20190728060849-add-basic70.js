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
  return db.runSql(
      'INSERT INTO users (google_id, email, given_name, family_name)' +
      ' VALUES (\'107690245925696602851\', \'basic70@gmail.com\', \'Daniel\', \'Brahneborg\')')
};

exports.down = function(db) {
  return db.runSql('DELETE FROM users WHERE id=1')
};

exports._meta = {
  "version": 1
};
