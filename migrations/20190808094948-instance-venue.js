'use strict';

var dbm;
var type;
var seed;

const async = require('async')

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
  return async.series([
    db.addColumn.bind(db, 'instances', 'venue', 'string'),
    db.addColumn.bind(db, 'instances', 'city', 'string'),
    db.addColumn.bind(db, 'instances', 'nearby_city', 'string'),
    db.addColumn.bind(db, 'instances', 'region', 'string'),
    db.addColumn.bind(db, 'instances', 'country', 'string'),
    db.runSql.bind(db,
      'UPDATE instances SET venue=\'Faculty of Sciences, University of Neuchâtel\',' +
      ' city=\'Neuchâtel\', country=\'Switzerland\'' +
      ' WHERE url=\'https://opodis2019.unine.ch\''),
    db.runSql.bind(db,
      'UPDATE instances SET venue=\'INSA Lyon, Campus La Doua\',' +
      ' city=\'Lyon\', country=\'France\'' +
      ' WHERE url=\'https://srds-conference.org/\''),
    db.runSql.bind(db,
      'UPDATE instances SET venue=\'Sutton Place Hotel\',' +
      ' city=\'Edmonton\', region=\'Alberta\', country=\'Canada\'' +
      ' WHERE url=\'https://icpe2020.spec.org\''),
    db.runSql.bind(db,
      'UPDATE instances SET venue=\'Hilton New Orleans Riverside\',' +
      ' city=\'New Orleans\', region=\'Louisiana\', country=\'USA\'' +
      ' WHERE url=\'http://www.ipdps.org\''),
    db.runSql.bind(db,
      'UPDATE instances SET venue=\'École de technologie supérieure\',' +
      ' city=\'Montreal\', region=\'Quebec\', country=\'Canada\'' +
      ' WHERE url=\'https://2020.debs.org\''),
    db.runSql.bind(db,
        'UPDATE instances SET venue=\'Seoul Dragon City Hotel\',' +
        ' city=\'Seoul\', country=\'South Korea\'' +
        ' WHERE url=\'https://conf.researchr.org/home/icse-2020\''),
  ], callback)
};

exports.down = function(db, callback) {
  return async.series([
    db.runSql.removeColumn(db, 'instances', 'venue'),
    db.runSql.removeColumn(db, 'instances', 'city'),
    db.runSql.removeColumn(db, 'instances', 'nearby_city'),
    db.runSql.removeColumn(db, 'instances', 'region'),
    db.runSql.removeColumn(db, 'instances', 'country'),
  ], callback)
};

exports._meta = {
  "version": 1
};
