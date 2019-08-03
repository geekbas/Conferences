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
      'INSERT INTO instances (year, url, conf_id) VALUES' +
      ' (\'2019\', \'https://novasys.di.fct.unl.pt/conferences/wpsds19\',' +
        '(select id from confs where acronym=\'W-PSDS\')' +
      ')' +
      ', (\'2018\', \'https://www.cs.otago.ac.nz/debs2018/\',' +
        '(select id from confs where acronym=\'DEBS\')' +
      ')' +
      ', (\'2019\', \'http://debs2019.org/\',' +
        '(select id from confs where acronym=\'DEBS\')' +
      ')' +
      ', (\'2019\', \'https://srds-conference.org/\',' +
        '(select id from confs where acronym=\'SRDS\')' +
      ')'
  )
}

exports.down = function(db) {
  return db.runSql('DELETE FROM instances')
}

exports._meta = {
  "version": 1
}
