const pool = require('./pgpool')

const date_fields = [ 'submission', 'notification', 'camera_ready' ]

class Track {
    static add(fields, done) {
        pool.query(
            'INSERT INTO tracks (instance_id, name, added_by_user_id, private_for_user_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [ fields.instance_id, fields.name, fields.added_by_user_id, fields.private_for_user_id ],
            { single: true },
            (res) => { done(res.id) }
        )
    }

    static update(id, fields, done) {
        pool.query(
            'UPDATE tracks SET name=$2, url=$3, page_limit=$4' +
                ', including_references=$5, double_blind=$6' +
                ', submission=$7, notification=$8, camera_ready=$9' +
                ' WHERE id=$1 RETURNING id',
            [
                id,
                fields.name, fields.url, fields.page_limit ? 0 + fields.page_limit : null,
                fields.including_references, fields.double_blind,
                fields.submission, fields.notification, fields.camera_ready,
            ],
            { single: true },
            (res) => { done(id) }
        )
    }

    static get_all(instance_id, f) {
        pool.query('SELECT * FROM tracks WHERE instance_id=$1 ORDER BY name ASC',
            [ instance_id ],
            { as_array: true, date_fields },
            (res) => {
                let dates = []
                res.forEach((entry) => {
                    Array.prototype.push.apply(dates, this.get_dates(entry))
                })
                f(res, dates)
            })
    }

    static get_dates(entry) {
        let dates = []
        date_fields.forEach((field) => {
            if (entry[field]) {
                let dentry = {
                    what: field.replace('_', ' '),
                    when: entry[field],
                    track_id: entry.id,
                    instance_id: entry.instance_id,
                    instance_year: entry.year,
                    conf_id: entry.conf_id,
                    track_name: entry.name,
                }
                dates.push(dentry)
            }
        })
        return dates
    }

    static get_all_for(instance_ids, f) {
        pool.query(
            'SELECT t.*, i.conf_id, i.year FROM tracks t' +
            ' INNER JOIN instances i ON t.instance_id=i.id' +
            ' WHERE i.id=ANY($1)',
            [ instance_ids ],
            { as_array: true, date_fields },
            (res) => {
                console.log('got all tracks', res)
                let dates = []
                res.forEach((entry) => {
                    Array.prototype.push.apply(dates, this.get_dates(entry))
                })
                f(res, dates)
            }
        )
    }

    static del(id, f) {
        return pool.del('tracks', id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id('tracks', id, { date_fields }, (obj) => { f(obj) })
    }
}

module.exports = Track
