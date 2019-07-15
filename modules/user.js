
const path = require('path')
const Storage = require('./storage')
const user_storage = new Storage('users')

class User {
    static findOrCreate(id_params, misc_params, f) {
        console.log('look for user', 'googleId', id_params.googleId)
        user_storage.get_all_by_key(
            [ { key_name: 'googleId', value: id_params.googleId } ],
            null,
            (list) => {
            if (list.length > 0) {
                return f(null, list[0])
            }
            console.log('add user', misc_params)
            user_storage.add(Object.assign({ googleId: id_params.googleId }, misc_params),
                (id) => {
                user_storage.get_by_id(id, (obj) => {
                    console.log('found new user', obj)
                    f(null, obj)
                })
            })
        })
    }

    static findById(id, f) {
//        console.log('look for user', id)
        user_storage.get_by_id(id, (obj) => {
            console.log('found user', obj)
            f(null, obj)
        })
    }

    static public_or_my_obj(obj, user) {
        return !obj.private_for_user_id ||
            (user && (user.id === obj.private_for_user_id))
    }

    static public_or_mine(list, user) {
        return list.filter((obj) => User.public_or_my_obj(obj, user))
    }

    static can_edit(obj, user) {
        return user &&
            ((user.id === obj.added_by_user_id) ||
                (user.id === 'gGdCRwnUndzKDM6gclbA'))
    }

    static can_delete(obj, user) {
        return user && (user.id === 'gGdCRwnUndzKDM6gclbA')
    }

}

module.exports = User
