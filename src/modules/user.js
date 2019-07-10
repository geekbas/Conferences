
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
        console.log('look for user', id)
        user_storage.get_by_id(id, (obj) => {
            console.log('found user', obj)
            f(null, obj)
        })
    }
}

module.exports = User
