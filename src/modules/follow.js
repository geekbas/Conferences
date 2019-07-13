
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
            console.log('no filter')
            return done(list)
        }
        if (list.length < 1) {
            return done(filtered_list)
        }
        const obj = list[0]
        console.log('check', obj, 'filter on', field)
        follow_storage.get_all_by_key(
            [
                { key_name: field, value: obj.id },
                { key_name: 'user_id', value: user.id }
            ],
            { limit: 1 },
            (follows) => {
    //            console.log('follows = ', follows)
                if (follows.length > 0) {
                    filtered_list.push(obj)
                }
                return Following.select_followed(list.slice(1), user, field, filtered_list, done)
            })
    }

}

module.exports = Following
