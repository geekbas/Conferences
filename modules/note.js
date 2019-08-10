const pool = require('./pgpool')
const md = require('jstransformer')(require('jstransformer-markdown-it'));

const table_name = 'notes'

function markdown_formatted(notes) {
    return notes.map((note) => {
        note.note = md.render(note.note).body
        return note
    })
}

class Note {
    static add(fields, done) {
        pool.add(table_name,
            [ 'user_id', 'private', 'conf_id', 'instance_id', 'track_id', 'note' ],
            fields,
            done)
    }

    static update(id, values, done) {
        pool.update(table_name, id, [ 'private', 'note' ], values, done)
    }

    static get(user_id, field_name, field_value, f) {
        let sql = 'SELECT * FROM ' + table_name + ' WHERE ' + field_name + '=$1'
        let params = [ field_value ]
        if (user_id) {
            sql += ' AND ((user_id=$2 OR user_id IS NULL)'
            params.push(user_id)
        } else {
            sql += ' AND (user_id IS NULL'
        }
        sql += ' OR private=false)'
        pool.query(sql, params, { as_array: true }, notes => { f(markdown_formatted(notes)) })
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
        return pool.get_by_id(table_name, id, null, f)
    }
}

module.exports = Note
