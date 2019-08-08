const pool = require('./pgpool')

const date_fields = [ 'conf_start', 'conf_end' ]

function get_dates(entry) {
    let dates = []
    date_fields.forEach((field) => {
        if (entry[field]) {
            dates.push({
                what: field.replace('conf_', 'Conference '),
                when: entry[field],
                conf_id: entry.conf_id,
                instance_id: entry.id,
                instance_year: entry.year
            })
        }
    })
    return dates
}

class Instance {

    static add(fields, done) {
        pool.query(
            'INSERT INTO instances (conf_id, year, url, added_by_user_id, private_for_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [ fields.conf_id, fields.year, fields.url, fields.added_by_user_id, fields.private_for_user_id ],
            { single: true },
            (res) => { done(res.id) }
        )
    }

    static update(id, values, done) {
        pool.update('instances', id, [ 'year', 'url', 'conf_start', 'conf_end' ], values, done)
    }

    static get_all(id_or_ids, f) {
        let sql ='SELECT * FROM instances where conf_id='
        sql += Array.isArray(id_or_ids) ? 'ANY($1)' : '$1'
        sql +=' ORDER BY year DESC'
        pool.query(sql,
            [ id_or_ids ],
            { as_array: true, date_fields },
            (res) => {
                let dates = []
                res.forEach((entry) => {
                    Array.prototype.push.apply(dates, get_dates(entry))
                })
                f(res, dates)
            })
    }

    static del(id, f) {
        return pool.del('instances', id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id(
            'instances',
            id,
            { date_fields },
            (entry) => {
                f(entry, get_dates(entry))
            })
    }
}

module.exports = Instance
