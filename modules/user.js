
const path = require('path')
const fs = require('fs')
const db_root = path.join(__dirname, '..', 'leveldb')
const level = require('level')
var user_db = null
var user_idx_extid = null
const cuid = require('cuid')
const basic70_id = 'gGdCRwnUndzKDM6gclbA'

fs.mkdir(db_root, (err) => {
    if (err && (err.code !== "EEXIST")) {
        console.log('mkdir errno', err.code)
    }
    user_db = level(path.join(db_root, 'users'), { valueEncoding: 'json' })
    user_idx_extid = level(path.join(db_root, 'users_idx_extid'))

    // init?
    const basic70_google_id = 'googleId-107690245925696602851'
    user_idx_extid.get(basic70_google_id, (err, value) => {
        if (err) {
            console.log('basic70 not found')
            user_db.put(basic70_id, {
                email: 'basic70@gmail.com',
                given_name: 'Daniel',
                family_name: 'Brahneborg'
            }, (err) => {
                user_idx_extid.put(basic70_google_id, basic70_id, (err) => {
                    console.log('basic70 saved')
                })
            })
        }
    })

})

class User {
    static findOrCreate(id_params, misc_params, f) {
        console.log('look for user', 'googleId', id_params.googleId)
        const key = 'googleId-' + id_params.googleId
        user_idx_extid.get(key, (err, value) => {
            console.log('foundOrCreate', id_params, 'misc', misc_params, '=> err', err, 'value', value)
            if (err.notFound) {
                const new_user = Object.assign(misc_params, { id: cuid() })
                user_db.put(new_user.id, new_user, (err) => {
                    user_idx_extid.put(key, new_user.id, (err) => {
                        f(err, new_user)
                    })
                })
            } else {
                user_db.get(value, (err, value2) => {
                    f(err, value2 === undefined ? value2 : Object.assign(value2), { id: value })
                })
            }
        })
    }

    static findById(id, f) {
        console.log('findById: look for user', id)
        user_db.get(id, (err, value) => {
            console.log('findById: found user', value)
            if ((err && err.notFound) || (value === undefined)) {
                f(null, undefined)
            } else {
                f(err, Object.assign(value, { id }))
            }
        })
    }

    static public_or_my_obj(obj, user) {
        return (obj.private_for_user_id === undefined) ||
            (user && (user.id === obj.private_for_user_id))
    }

    static public_or_mine(list, user) {
        return list.filter((obj) => User.public_or_my_obj(obj, user))
    }

    static can_edit(obj, user) {
        return user &&
            ((user.id === obj.added_by_user_id) ||
                (user.id === basic70_id))
    }

    static can_delete(obj, user) {
        return user && (user.id === basic70_id)
    }

}

module.exports = User
