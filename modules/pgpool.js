
const { Pool, Client } = require('pg')

//console.log('Pool', Pool, 'Client', Client)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
//console.log('pool', pool)

const moment = require('moment')

function query(sql, params, options, done) {
    pool.query(
        sql,
        params.map((entry) => entry === '' ? null : entry),
        (err, res) => {
        if (err) throw err

        if (options && options.single) {
            if (res.rowCount > 0) {
                const obj = res.rows[0]
                return done(obj)
            } else {
                return done(null)
            }
        }

        if (options && options.as_array) {
            let an_array = []
            res.rows.forEach((entry) => an_array.push(entry))
            return done(an_array)
        }

        var list = new Map()
        res.rows.forEach((entry) => {
//                console.log(entry.id, entry.data());
//                const d = this.fix_types(entry.data())
            list.set(entry.id, entry)
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
        { single: true },
        (res) => {
            if (res && options && options.date_fields) {
                options.date_fields.forEach((field) => {
                    if (res[field])
                        res[field] = moment(res[field]).format('YYYY-MM-DD')
                })
            }
            f(res)
        })
}

module.exports = {
    query,
    get_client,
    del,
    get_by_id
}
