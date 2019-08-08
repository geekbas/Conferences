
const { Pool, Client } = require('pg')

//console.log('Pool', Pool, 'Client', Client)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
//console.log('pool', pool)

const moment = require('moment')

function format_dates(entry, options) {
    if (entry && options && options.date_fields) {
        options.date_fields.forEach((field) => {
            if (entry[field])
                entry[field] = moment(entry[field]).format('YYYY-MM-DD')
        })
    }
    return entry
}

function query(sql, params, options, done) {
    pool.query(
        sql,
        params ? params.map((entry) => entry === '' ? null : entry) : null,
        (err, res) => {
        if (err) throw err

        if (options && options.single) {
            if (res.rowCount > 0) {
                const obj = format_dates(res.rows[0], options)
                return done(obj)
            } else {
                return done(null)
            }
        }

        if (options && options.as_array) {
            let an_array = []
            res.rows.forEach((entry) => an_array.push(format_dates(entry, options)))
            return done(an_array)
        }

        var list = new Map()
        res.rows.forEach((entry) => {
//                console.log(entry.id, entry.data());
//                const d = this.fix_types(entry.data())
            list.set(entry.id, format_dates(entry, options))
        })
        done(list)
    })
}

function get_client(f) {
    pool.connect((err, client, done) => {
        if (err) throw err
        f(client, done)
    })
}

// helpers

function del(table, id, f) {
    return query(
        'DELETE FROM ' + table + ' WHERE id=$1',
        [ id ],
        null,
        (res) => { f(res) })
}

function get_by_id(table, id, options, f) {
    return query(
        'SELECT * FROM ' + table + ' WHERE id=$1 LIMIT 1',
        [ id ],
        Object.assign({ single: true }, options),
        (res) => { f(res) })
}

function update(table, id, field_names, values, f) {
    let params = [ id ]
    let sql = 'UPDATE ' + table + ' SET';
    field_names.forEach((field_name) => {
        if (values[field_name] !== undefined) {
            let np = params.length
            if (np > 1)
                sql += ','
            sql += ' ' + field_name + '=$' + (np + 1)
            params.push(values[field_name])
        }
    })
    sql += ' WHERE id=$1 RETURNING id'
    console.log('final sql:', sql)
    return query(sql, params,{ single: true },(res) => { f(id) })
}

module.exports = {
    query,
    get_client,
    del,
    get_by_id,
    update,
}
