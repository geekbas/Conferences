const pool = require('./pgpool')

const table_name = 'submissions'

class Submission {
    static add(fields, done) {
        pool.add(table_name, [ 'track_id', 'user_id', 'title' ], fields, done)
    }

    static update(id, values, done) {
        pool.update(table_name, id, [ 'title', 'url', 'track_id' ], values, done)
    }

    static get_all(user_id, track_id, f) {
        if (!user_id || !track_id) return f(null)
        pool.query(
            'SELECT * FROM ' + table_name + ' WHERE user_id=$1 AND track_id=$2 ORDER BY title ASC',
            [ user_id, track_id ],
            { as_array: true },
            f)
    }

    static get_all_mine(user_id, f) {
        if (!user_id) return f(null)
        pool.query(
            'SELECT s.id as submission_id, s.*,' +
            ' t.id AS track_id, t.name AS track_name, t.instance_id, t.submission,' +
            ' i.year AS instance_year, i.conf_id,' +
            ' c.name AS conf_name' +
            ' FROM ' + table_name + ' s' +
            ' INNER JOIN tracks t ON s.track_id=t.id' +
            ' INNER JOIN instances i ON t.instance_id=i.id' +
            ' INNER JOIN confs c ON i.conf_id=c.id' +
            ' AND s.user_id=$1',
            [ user_id ],
            { as_array: true, date_fields: [ 'submission' ] },
            f)
    }

    static del(id, f) {
        return pool.del(table_name, id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id(table_name, id, null, f)
    }
}

module.exports = Submission
