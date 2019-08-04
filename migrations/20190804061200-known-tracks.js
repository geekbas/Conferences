'use strict'

var dbm
var type
var seed

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = function(db) {
  return db.runSql(
      'INSERT INTO tracks (name, url, instance_id) VALUES' +
      ' (\'PhD Symposium\', \'http://debs2019.org/Calls/Call_for_Doctoral_Symposium.html\',' +
        '(select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'DEBS\' and i.year=\'2019\')' +
      '),' +
      '(\'Research Papers\', \'http://debs2019.org/Calls/Call_for_Research_Papers.html\',' +
        '(select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'DEBS\' and i.year=\'2019\')' +
      '),' +
      '(\'Industry Papers\', \'http://debs2019.org/Calls/Call_for_Industry_Papers.html\',' +
        '(select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'DEBS\' and i.year=\'2019\')' +
      '),' +
      '(\'PhD Forum\', \'https://srds-conference.org/calls/phd/\',' +
        '(select i.id from instances i inner join confs c on c.id=i.conf_id and c.acronym=\'SRDS\' and i.year=\'2019\')' +
      ')'
  )
}

exports.down = function(db) {
  return db.runSql('DELETE FROM tracks')
}

exports._meta = {
  "version": 1
}
