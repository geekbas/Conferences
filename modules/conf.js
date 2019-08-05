
const pool = require('./pgpool')
const Following = require('./follow')

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
        let sql = 'SELECT c.* FROM confs c'
        let params = []
        if (options && options.followed_by) {
            sql += ' INNER JOIN follows f ON f.conf_id=c.id AND f.user_id=$1'
            params.push(options.followed_by)
        }
        sql += ' ORDER BY c.name ASC'
        pool.query(sql, params, options, (res) => { f(res) })
    }

    // generics

    static del(id, f) {
        Following.removing_conf(id, () => {
            return pool.del('confs', id, f)
        })
    }

    static get_by_id(id, f) {
        return pool.get_by_id('confs', id, null, (res) => { f(res) })
    }
}

module.exports = Conf
