
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

    static select_followed(list, user, filtered_list, done) {
        if (!user) {
//            console.log('no filter')
            return done(list)
        }
//        console.log('filtered so far', filtered_list)
        const obj_id = list.keys().next().value
//        console.log('select_followed, next id is', obj_id)
        if ((list.size < 1) || (obj_id === undefined)) {
            return done(filtered_list)
        }
        const obj = list.get(obj_id)
//        console.log('check', obj, 'filter on conf_id=', obj_id)
        pool.query(
            'SELECT COUNT(*) AS count FROM follows WHERE conf_id=$1 AND user_id=$2',
            [ obj_id, user.id ],
            { single: true },
            (res) => {
//                console.log('got res', res, 'for conf', obj_id)
                if (res.count > 0) {
                    filtered_list.set(obj_id, obj)
                }
                list.delete(obj_id)
                return Following.select_followed(list, user, filtered_list, done)
            })
    }

}

module.exports = Following
