
const path = require('path')
const Storage = require(path.join('..', 'modules', 'storage'))
const follow_storage = new Storage('follows')

class Following {

    static follow(user, entry, done) {
        if (user) {
            follow_storage.add(
                Object.assign(entry, { user_id: user.id }),
                (id) => done(id))
        } else {
            done(null)
        }
    }

    static unfollow(id, done) {
        console.log('delete', req.params.id)
        follow_storage.del(req.params.id, (entry) => done)
    }

    static select_followed(list, user, field, filtered_list, done) {
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
//        console.log('check', obj, 'filter on', field, '=', obj_id)
        follow_storage.get_all_by_key(
            [
                { key_name: field, value: obj_id },
                { key_name: 'user_id', value: user.id }
            ],
            { limit: 1 },
            (follows) => {
//                console.log('follows = ', follows, 'length', follows.size)
                if (follows.size > 0) {
                    filtered_list.set(obj_id, obj)
                }
                list.delete(obj_id)
                return Following.select_followed(list, user, field, filtered_list, done)
            })
    }

}

module.exports = Following
