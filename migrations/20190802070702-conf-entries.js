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
    'INSERT INTO confs (acronym, name, url, format) VALUES' +
      ' (\'DEBS\', \'Distributed and Event-Based Systems\', \'http://debs.org\', \'ACM\')' +
      ',(\'SRDS\', \'Symposium on Reliable Distributed Systems\', null, null)' +
      ',(\'W-PSDS\', \'Workshop on Planetary-Scale Distributed Systems\', null, null)' +
      ',(\'ICSE\', \'SW Engineering Something\', null, null)'
    )
};

exports.down = function(db) {
  return db.runSql('DELETE FROM confs')
};

exports._meta = {
  "version": 1
};
