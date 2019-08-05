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
    db.addColumn.bind(db, 'tracks', 'submission', 'date'),
    db.addColumn.bind(db, 'tracks', 'notification', 'date'),
    db.addColumn.bind(db, 'tracks', 'camera_ready', 'date'),
    db.runSql.bind(db,
        'INSERT INTO tracks (name, submission, instance_id) VALUES' +
        ' (\'Research Track\', \'2020-02-25\', ' +
        '(select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'DEBS\' and i.year=2020))'),
  ], callback)
};

exports.down = function(db, callback) {
  async.series([
    db.runSql.bind(db, 'DELETE FROM tracks WHERE submission IS NOT NULL'),
    db.removeColumn.bind(db, 'tracks', 'submission'),
    db.removeColumn.bind(db, 'tracks', 'notification'),
    db.removeColumn.bind(db, 'tracks', 'camera_ready'),
  ], callback)
}

exports._meta = {
  "version": 1
};
