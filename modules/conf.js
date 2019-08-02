
const Storage = require('./storage')
const conf_storage = new Storage('confs')
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
            'UPDATE confs SET acronym=$2, name=$3, url=$4, format=$5, acceptance_rate=$6 WHERE id=$1',
            [ id, fields.acronym, fields.name, fields.url, fields.format, fields.acceptance_rate ],
            { single: true },
            (res) => {
                done(id)
            }
        )
    }

    static del(id, f) {
        pool.query(
            'DELETE FROM confs WHERE id=$1',
            [ id ],
            null,
            (res) => {
                f(res)
            }
        )
    }

    static get_all(params, f) {
        let sql = 'SELECT * FROM confs'
        if (params.asc)
            sql = sql + ' ORDER BY ' + params.asc + ' ASC'
        pool.query(sql, null, null, (res) => {
            f(res)
        })
    }

    static get_by_id(id, f) {
        console.log('Conf.get_by_id', id)
        pool.query(
            'SELECT * FROM confs WHERE id=$1 LIMIT 1',
            [ id ],
            { single: true },
            (res) => { f(res) }
        )
    }

    static load_all_as_array(done) {
        let confs = []
        conf_storage.get_all(null, (clist) => {
            clist.forEach((entry) => confs[entry.id] = entry)
            done(confs)
        })
    }

}

module.exports = Conf
