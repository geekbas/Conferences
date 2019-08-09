const pool = require('./pgpool')

const table_name = 'notes'

class Note {
    static add(fields, done) {
        pool.query(
            'INSERT INTO ' + table_name + ' (user_id, private, conf_id, instance_id, track_id, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [ fields.user_id, fields.private, fields.conf_id, fields.instance_id, fields.track_id, fields.note ],
            { single: true },
            (res) => { done(res.id) }
        )
    }

    static update(id, values, done) {
        pool.update(table_name, id, [ 'private', 'note' ], values, done)
    }

    static get(user_id, field_name, field_value, f) {
        let sql = 'SELECT * FROM ' + table_name + ' WHERE ' + field_name + '=$1'
        let params = [ field_value ]
        if (user_id) {
            sql += ' AND (user_id=$2 OR user_id IS NULL)'
            params.push(user_id)
        } else {
            sql += ' AND user_id IS NULL'
        }
        pool.query(sql, params, { as_array: true }, (res) => { f(res) })
    }

    static get_mine(user_id, field_name, field_value, f) {
        let sql = 'SELECT * FROM ' + table_name + ' WHERE ' + field_name + '=$1 AND user_id=$2'
        let params = [ field_value, user_id ]
        pool.query(sql, params, { as_array: true }, (res) => {
            let private_note = undefined
            let public_note = undefined
            res.forEach((note) => {
                if (note.private) private_note = note
                else public_note = note
            })
            f(private_note, public_note)
        })
    }

    static del(id, f) {
        return pool.del(table_name, id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id(table_name, id, null, (obj) => { f(obj) })
    }
}

module.exports = Note
