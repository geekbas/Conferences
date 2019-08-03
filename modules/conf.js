
const pool = require('./pgpool')

class Conf {

    static add(fields, done) {
        pool.query(
            'INSERT INTO confs (acronym, name, added_by_user_id, private_for_user_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [ fields.acronym, fields.name, fields.added_by_user_id, fields.private_for_user_id ],
            { single: true },
            (res) => {
                done(res.id)
            }
        )
    }

    static update(id, fields, done) {
        pool.query(
            'UPDATE confs SET acronym=$2, name=$3, url=$4, format=$5, acceptance_rate=$6 WHERE id=$1 RETURNING id',
            [ id, fields.acronym, fields.name, fields.url, fields.format, fields.acceptance_rate ],
            { single: true },
            (res) => {
                done(id)
            }
        )
    }

    static get_all(options, f) {
        let sql = 'SELECT * FROM confs ORDER BY name ASC'
        pool.query(sql,
            null,
            (options && options.as_array) ? { as_array: true } : null, (res) => {
                f(res)
            })
    }

    // generics

    static del(id, f) {
        return pool.del('confs', id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id('confs', id, (res) => { f(res) })
    }
}

module.exports = Conf
