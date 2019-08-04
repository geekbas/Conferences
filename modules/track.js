const pool = require('./pgpool')

class Track {
    static add(fields, done) {
        pool.query(
            'INSERT INTO tracks (instance_id, name, added_by_user_id, private_for_user_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [ fields.instance_id, fields.name, fields.added_by_user_id, fields.private_for_user_id ],
            { single: true },
            (res) => { done(res.id) }
        )
    }

    static update(id, fields, done) {
        pool.query(
            'UPDATE tracks SET name=$2, url=$3, page_limit=$4, including_references=$5, double_blind=$6 WHERE id=$1 RETURNING id',
            [ id, fields.name, fields.url, fields.page_limit, fields.including_references, fields.double_blind ],
            { single: true },
            (res) => { done(id) }
        )
    }

    static get_all(instance_id, f) {
        pool.query('SELECT * FROM tracks where instance_id=$1 ORDER BY name ASC',
            [ instance_id ],
            { as_array: true },
            (res) => { f(res) })
    }

    // generics

    static del(id, f) {
        return pool.del('tracks', id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id('tracks', id, (res) => { f(res) })
    }
}

module.exports = Track
