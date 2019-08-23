const pool = require('./pgpool')

const date_fields = [ 'conf_start', 'conf_end' ]

function get_dates(entry) {
    if (!entry) return null
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

const table_name = 'instances'

class Instance {

    static add(fields, done) {
        pool.add(
            table_name,
            [ 'conf_id', 'year', 'url', 'added_by_user_id' ],
            fields,
            done)
    }

    static update(id, values, done) {
        pool.update(table_name, id,
            [ 'year', 'url', 'conf_start', 'conf_end', 'parent_id',
                'venue', 'city', 'nearby_city', 'region', 'country' ],
            values, done)
    }

    static get_all(id_or_ids, f) {
        let sql ='SELECT * FROM ' + table_name + ' WHERE conf_id='
        sql += Array.isArray(id_or_ids) ? 'ANY($1)' : '$1'
        sql +=' ORDER BY year DESC'
        pool.query(sql,
            [ id_or_ids ],
            { as_array: true, date_fields: [ 'conf_start' ] },
            (res) => {
                let dates = []
                res.forEach((entry) => {
                    Array.prototype.push.apply(dates, get_dates(entry))
                })
                f(res, dates)
            })
    }

    static get_all_by_region(user_id, f) {
        let sql =
            'SELECT c.id AS conf_id, c.name AS conf_name, c.acronym,' +
            ' i.*,' +
            ' i.id as instance_id,' +
            ' COALESCE(i.city,\'.\') as city,' +
            ' COALESCE(i.nearby_city,\'.\') as nearby_city,' +
            ' COALESCE(i.region,\'.\') as region,' +
            ' COALESCE(i.country,\'.\') as country' +
            ' FROM ' + table_name + ' i' +
            ' INNER JOIN confs c ON i.conf_id=c.id' +
            ' INNER JOIN follows f ON f.conf_id=c.id AND f.user_id=$1' +
            ' ORDER BY i.country, i.region, i.nearby_city, i.city, i.conf_start, i.venue'
        pool.query(sql, [ user_id ], { as_array: true, date_fields }, f)
    }

    static get_with_conf(id, done) {
        let sql =
            'SELECT c.id AS conf_id, c.name AS conf_name, c.acronym,' +
            ' i.*, i.id as instance_id' +
            ' FROM ' + table_name + ' i' +
            ' INNER JOIN confs c ON i.conf_id=c.id' +
            ' AND i.id=$1'
        pool.query(sql, [ id ], { single: true, date_fields }, done)
    }

    static get_potential_parents(instance, done) {
        if (!instance.conf_start || !instance.conf_end) { return done([]) }
        let sql =
            'SELECT c.id AS conf_id, c.name AS conf_name, c.acronym,' +
            ' i.*, i.id as instance_id' +
            ' FROM ' + table_name + ' i' +
            ' INNER JOIN confs c ON i.conf_id=c.id' +
            ' AND i.id != $1' +
            ' AND i.conf_start IS NOT NULL AND i.conf_start <= $2' +
            ' AND i.conf_end IS NOT NULL AND i.conf_end >= $3'
        pool.query(
            sql,
            [ instance.id, instance.conf_start, instance.conf_end ],
            { as_array: true, date_fields },
            done)
    }

    static get_children_to(id, done) {
        console.log('find children to', id)
        let sql =
            'SELECT c.id AS conf_id, c.name AS conf_name, c.acronym,' +
            ' i.*, i.id as instance_id' +
            ' FROM ' + table_name + ' i' +
            ' INNER JOIN confs c ON i.conf_id=c.id' +
            ' AND i.parent_id = $1'
        pool.query(
            sql,
            [ id ],
            { as_array: true, date_fields },
            done)
    }

    static del(id, f) {
        return pool.del(table_name, id, f)
    }

    static get_by_id(id, f) {
        return pool.get_by_id(
            table_name,
            id,
            { date_fields },
            (entry) => { f(entry, get_dates(entry)) })
    }
}

module.exports = Instance
