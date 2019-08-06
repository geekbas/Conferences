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

    static get_all(track_id, user_id, f) {
        if (!track_id || !user_id) return f(null)
        pool.query('SELECT * FROM submissions WHERE track_id=$1 AND user_id=$2 ORDER BY title ASC',
            [ track_id, user_id ],
            { as_array: true },
            (res) => {
                console.log('Submission.get_all loaded', res)
                f(res)
            })
    }

    static del(id, f) {
        return pool.del('submissions', id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id('submissions', id, null, (obj) => { f(obj) })
    }
}

module.exports = Submission
