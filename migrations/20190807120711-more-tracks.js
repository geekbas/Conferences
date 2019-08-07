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

const debs2020 = '(select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'DEBS\' and i.year=2020)'

exports.up = function(db, callback) {
  async.series([
    db.runSql.bind(db,
      'INSERT INTO tracks (name, url, instance_id) VALUES' +
        ' (\'Industry Papers\', \'https://2020.debs.org\',' + debs2020 + ')'),

    db.runSql.bind(db,
      'INSERT INTO confs (acronym, name, format) VALUES' +
      ' (\'OPODIS\', \'Principles Of Distributed Systems\', \'LIPI\')'),
    db.runSql.bind(db,
      'INSERT INTO instances (year, url, conf_start, conf_end, conf_id) VALUES' +
      ' (2019, \'https://opodis2019.unine.ch\', \'2019-12-17\', \'2019-12-19\',' +
      '(select id from confs where acronym=\'OPODIS\')' +
      ')'),
    db.runSql.bind(db,
      'INSERT INTO tracks (name, submission, notification, camera_ready, instance_id) VALUES' +
      ' (\'Common\', \'2019-09-05\', \'2019-10-25\', \'2019-11-14\', ' +
      ' (select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'OPODIS\' and i.year=2019))'),

    db.runSql.bind(db,
        'INSERT INTO confs (acronym, name, format) VALUES' +
        ' (\'IPDPS\', \'International Parallel and Distributed Processing Symposium\', \'IEEE\')'),
    db.runSql.bind(db,
        'INSERT INTO instances (year, url, conf_start, conf_end, conf_id) VALUES' +
        ' (2020, \'http://www.ipdps.org\', \'2020-05-18\', \'2020-05-22\',' +
        '(select id from confs where acronym=\'IPDPS\')' +
        ')'),
    db.runSql.bind(db,
        'INSERT INTO tracks (name, submission, notification, camera_ready, instance_id) VALUES' +
        ' (\'Common\', \'2019-10-14\', \'2019-12-09\', \'2020-02-15\', ' +
        ' (select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'IPDPS\' and i.year=2020))'),

    db.runSql.bind(db,
        'INSERT INTO confs (acronym, name, format) VALUES' +
        ' (\'ICPE\', \'International Conference on Performance Engineering\', \'ACM\')'),
    db.runSql.bind(db,
        'INSERT INTO instances (year, url, conf_start, conf_end, conf_id) VALUES' +
        ' (2020, \'https://icpe2020.spec.org\', \'2020-04-20\', \'2020-04-24\',' +
        '(select id from confs where acronym=\'ICPE\')' +
        ')'),
    db.runSql.bind(db,
        'INSERT INTO tracks (name, submission, notification, camera_ready, instance_id) VALUES' +
        ' (\'Papers\', \'2019-10-11\', \'2019-12-10\', \'2020-01-31\', ' +
        ' (select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'ICPE\' and i.year=2020))'),
    db.runSql.bind(db,
        'INSERT INTO tracks (name, submission, notification, camera_ready, instance_id) VALUES' +
        ' (\'Work-in-progress\', \'2020-01-20\', \'2020-02-04\', \'2020-02-24\', ' +
        ' (select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'ICPE\' and i.year=2020))'),

  ], callback)
};

exports.down = function(db, callback) {
};

exports._meta = {
  "version": 1
};
