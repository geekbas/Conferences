
const pool = require('./pgpool')
const Following = require('./follow')

const table_name = 'confs'

class Conf {

    static add(fields, done) {
        pool.add(table_name,
            [ 'acronym', 'name', 'added_by_user_id' ],
            fields,
            done)
    }

    static update(id, values, done) {
        pool.update(table_name, id,
            [ 'acronym', 'name', 'url', 'format', 'acceptance_rate' ],
            values, done)
    }

    static get_all(options, f) {
        let sql = 'SELECT c.* FROM ' + table_name + ' c'
        let params = []
        if (options && options.followed_by) {
            sql += ' INNER JOIN follows f ON f.conf_id=c.id AND f.user_id=$1'
            params.push(options.followed_by)
        }
        sql += ' ORDER BY c.name ASC'
        pool.query(sql, params, options, f)
    }

    // generics

    static del(id, f) {
        Following.removing_conf(id, () => {
            return pool.del(table_name, id, f)
        })
    }

    static get_by_id(id, f) {
        return pool.get_by_id(table_name, id, null, f)
    }
}

module.exports = Conf
