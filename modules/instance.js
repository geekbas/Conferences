const pool = require('./pgpool')

const date_fields = [ 'conf_start', 'conf_end' ]

function get_dates(entry) {
    let dates = []
    date_fields.forEach((field) => {
        if (entry[field]) {
            dates.push({
                what: field.replace('conf_', ''),
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

    static update(id, fields, done) {
        pool.query(
            'UPDATE instances SET year=$2, url=$3, conf_start=$4, conf_end=$5 WHERE id=$1 RETURNING id',
            [ id, fields.year, fields.url, fields.conf_start, fields.conf_end ],
            { single: true },
            (res) => { done(id) }
        )
    }

    static get_all(id, f) {
        pool.query('SELECT * FROM instances where conf_id=$1 ORDER BY year DESC',
            [ id ],
            { as_array: true, date_fields },
            (res) => {
                let dates = []
                res.forEach((entry) => {
                    Array.prototype.push.apply(dates, get_dates(entry))
                })
                f(res, dates)
            })
    }

    static get_all_for(ids, f) {
        pool.query('SELECT * FROM instances where conf_id=ANY($1) ORDER BY year DESC',
            [ ids ],
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
