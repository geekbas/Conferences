
const path = require('path')
const Storage = require(path.join('..', 'modules', 'storage'))
const follow_storage = new Storage('follows')

class Following {

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
