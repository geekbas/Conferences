
const path = require('path')
const Storage = require(path.join('..', 'modules', 'storage'))

const pool = require('./pgpool')

class Following {

    static follow(user, conf_id, done) {
        if (user) {
            pool.query(
                'INSERT INTO follows (user_id, conf_id) VALUES ($1, $2) RETURNING id',
                [ user.id, conf_id ],
                { single: true },
                (id) => { done(id) })
        } else {
            done(null)
        }
    }

    static follows_conf(user_id, conf_id, done) {
        if (!user_id) return done(null)
        pool.query('SELECT id FROM follows WHERE user_id=$1 AND conf_id=$2 LIMIT 1',
            [ user_id, conf_id ],
            { single: true },
            (res) => { done(res) })
    }

    static unfollow(id, done) {
        pool.query('DELETE FROM follows WHERE id=$1',
            [ id ],
            { single: true },
            () => { done() })
    }

    static removing_conf(conf_id, done) {
        pool.query('DELETE FROM follows WHERE conf_id=$1',
            [ conf_id ],
            { single: true },
            () => { done() })
    }

    static select_followed(entries, user, filtered_list, done) {
        if (!user) {
//            console.log('no filter')
            return done(entries)
        }
//        console.log('filtered so far', filtered_list)
        const obj = entries.shift()
        if (obj === undefined) {
            return done(filtered_list)
        }
        pool.query(
            'SELECT COUNT(*) AS count FROM follows WHERE conf_id=$1 AND user_id=$2',
            [ obj.id, user.id ],
            { single: true },
            (res) => {
//                console.log('got res', res, 'for conf', obj_id)
                if (res.count > 0) {
                    filtered_list.push(obj)
                }
                return Following.select_followed(entries, user, filtered_list, done)
            })
    }

}

module.exports = Following
