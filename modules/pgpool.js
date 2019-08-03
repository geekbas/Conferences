
const { Pool, Client } = require('pg')

//console.log('Pool', Pool, 'Client', Client)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
//console.log('pool', pool)

module.exports = {
    query: (sql, params, options, done) => {
        pool.query(sql, params, (err, res) => {
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
                res.rows.forEach((entry) => an_array[entry.id] = entry)
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
    },

    get_client: (f) => {
        pool.connect((err, client, done) => {
            if (err) throw err
            f(client, done)
        })
    }
}
