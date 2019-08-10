const pool = require('./pgpool')
const moment = require('moment')

const table_name = 'tracks'
const date_fields = [ 'submission', 'notification', 'camera_ready' ]

class Track {
    static add(fields, done) {
        pool.add(
            table_name,
            [ 'instance_id', 'name', 'added_by_user_id' ],
            fields,
            done)
    }

    static update(id, values, done) {
        pool.update(table_name, id,
            [ 'name', 'url', 'page_limit', 'including_references', 'double_blind',
                'submission', 'notification', 'camera_ready' ],
            values, done)
    }

    static get_all(instance_id, f) {
        pool.query('SELECT * FROM ' + table_name + ' WHERE instance_id=$1 ORDER BY name ASC',
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
            'SELECT t.*, i.conf_id, i.year FROM ' + table_name + ' t' +
            ' INNER JOIN instances i ON t.instance_id=i.id' +
            ' WHERE i.id=ANY($1)',
            [ instance_ids ],
            { as_array: true, date_fields },
            (res) => {
                let dates = []
                res.forEach((entry) => {
                    Array.prototype.push.apply(dates, this.get_dates(entry))
                })
                f(res, dates)
            }
        )
    }

    static find_upcoming(user_id, options, f) {
        let params = [ user_id ]
        let sql =
            'SELECT c.id AS conf_id, c.name AS conf_name, c.acronym,' +
            ' i.year AS instance_year, i.city, i.country,' +
            ' t.id AS track_id, t.name AS track_name, t.* FROM ' + table_name + ' t' +
            ' INNER JOIN instances i ON t.instance_id=i.id' +
            ' INNER JOIN confs c ON i.conf_id=c.id' +
            ' INNER JOIN follows f ON f.conf_id=c.id AND f.user_id=$1' +
            ' AND submission>'
        if (options && options.after) {
            sql += '$2'
            params.push(moment(options.after))
        } else {
            sql += 'now()'
        }
        sql += ' ORDER BY t.submission'
        pool.query(sql,
            params,
            { as_array: true, date_fields },
            (res) => { f(res) }
        )
    }

    static del(id, f) {
        return pool.del(table_name, id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id(table_name, id, { date_fields }, f)
    }
}

module.exports = Track
