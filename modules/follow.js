
const pool = require('./pgpool')

const table_name = 'follows'

class Following {

    static follow(user, conf_id, done) {
        if (!user) return done(null)
        pool.add(table_name, [ 'user_id', 'conf_id' ],
            { user_id: user.id, conf_id },
            done)
    }

    static follows_conf(user_id, conf_id, done) {
        if (!user_id) return done(null)
        pool.query('SELECT id FROM ' + table_name + ' WHERE user_id=$1 AND conf_id=$2 LIMIT 1',
            [ user_id, conf_id ],
            { single: true },
            (res) => { done(res) })
    }

    static unfollow(id, done) {
        pool.del(table_name, id, done)
    }

    static removing_conf(conf_id, done) {
        pool.query('DELETE FROM ' + table_name + ' WHERE conf_id=$1',
            [ conf_id ],
            { single: true },
            () => { done() })
    }

}

module.exports = Following
