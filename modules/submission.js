const pool = require('./pgpool')

class Submission {
    static add(fields, done) {
        pool.query(
            'INSERT INTO submissions (track_id, user_id, title) VALUES ($1, $2, $3) RETURNING id',
            [ fields.track_id, fields.user_id, fields.title ],
            { single: true },
            (res) => { done(res.id) }
        )
    }

    static update(id, fields, done) {
        pool.query(
            'UPDATE submissions SET title=$2, url=$3 WHERE id=$1',
            [ id, fields.title, fields.url ],
            { single: true },
            (res) => { done(id) }
        )
    }

    static get_all(user_id, track_id, f) {
        if (!user_id || !track_id) return f(null)
        pool.query(
            'SELECT * FROM submissions WHERE user_id=$1 AND track_id=$2 ORDER BY title ASC',
            [ user_id, track_id ],
            { as_array: true },
            (res) => {
                console.log('Submission.get_all loaded', res)
                f(res)
            })
    }

    static get_all_mine(user_id, f) {
        if (!user_id) return f(null)
        pool.query(
            'SELECT s.*,' +
            ' t.id AS track_id, t.name AS track_name, t.instance_id,' +
            ' i.year AS instance_year, i.conf_id,' +
            ' c.name AS conf_name' +
            ' FROM submissions s' +
            ' INNER JOIN tracks t ON s.track_id=t.id' +
            ' INNER JOIN instances i ON t.instance_id=i.id' +
            ' INNER JOIN confs c ON i.conf_id=c.id' +
            ' AND s.user_id=$1',
            [ user_id ],
            { as_array: true },
            (res) => f(res)
        )
    }

    static del(id, f) {
        return pool.del('submissions', id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id('submissions', id, null, (obj) => { f(obj) })
    }
}

module.exports = Submission
