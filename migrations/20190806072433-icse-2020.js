'use strict';

const async = require('async')

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

exports.up = function(db, callback) {
  async.series([
    db.runSql.bind(db,
      'UPDATE confs SET name=\'International Conference on Software Engineering\'' +
      ', format=\'ACM\'' +
      ' WHERE acronym=\'ICSE\''),
    db.runSql.bind(db,
      'INSERT INTO instances (conf_id, year, conf_start, conf_end, url)' +
      ' VALUES ((select id from confs where acronym=\'ICSE\'), 2020, \'2020-05-23\', \'2020-05-29\'' +
      ',\'https://conf.researchr.org/home/icse-2020\'' +
      ')')
  ], callback)
};

exports.down = function(db, callback) {
  async.series([
    db.runSql.bind(db,
        'DELETE FROM instances WHERE conf_id=(select id from confs where acronym=\'ICSE\')')
  ], callback)
};

exports._meta = {
  "version": 1
};
