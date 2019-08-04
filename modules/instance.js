const pool = require('./pgpool')

class Instance {

    static add(fields, done) {
        pool.query(
            'INSERT INTO instances (conf_id, year, url, added_by_user_id, private_for_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [ fields.conf_id, fields.year, fields.url, fields.added_by_user_id, fields.private_for_user_id ],
            { single: true },
            (res) => { done(res.id) }
        )
    }

    static update(id, fields, done) {
        pool.query(
            'UPDATE instances SET year=$2, url=$3, conf_start=$4, conf_end=$5 WHERE id=$1 RETURNING id',
            [ id, fields.year, fields.url, fields.conf_start, fields.conf_end ],
            { single: true },
            (res) => { done(id) }
        )
    }

    static get_all(id, f) {
        pool.query('SELECT * FROM instances where conf_id=$1 ORDER BY year DESC',
            [ id ],
            { as_array: true },
            (res) => { f(res) })
    }

    // generics

    static del(id, f) {
        return pool.del('instances', id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id('instances', id, (res) => { f(res) })
    }
}

module.exports = Instance
