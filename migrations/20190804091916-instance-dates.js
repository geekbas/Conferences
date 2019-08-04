'use strict';

var dbm;
var type;
var seed;

var async = require('async')

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
    db.addColumn.bind(db, 'instances', 'conf_start', 'date'),
    db.addColumn.bind(db, 'instances', 'conf_end', 'date'),
    db.runSql.bind(db,
        'UPDATE instances SET conf_start=\'2019-06-24\', conf_end=\'2019-06-28\' WHERE ' +
        ' id=(select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'DEBS\' and i.year=\'2019\')'),
    db.runSql.bind(db,
        'INSERT INTO instances (conf_id, year, url, conf_start, conf_end) VALUES (' +
          '(select id from confs where acronym=\'DEBS\'), 2020, \'https://2020.debs.org\', \'2020-07-13\', \'2020-07-17\'' +
        ')'),
  ], callback)
}

exports.down = function(db, callback) {
  async.series([
    db.removeColumn.bind(db, 'instances', 'conf_start'),
    db.removeColumn.bind(db, 'instances', 'conf_end'),
  ], callback)
}

exports._meta = {
  "version": 1
}
