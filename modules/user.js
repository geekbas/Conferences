
//const cuid = require('cuid')
const basic70_id = 1
//const basic70_google_id = '107690245925696602851'
const pool = require('./pgpool')

class User {
    static findOrCreate(id_params, misc_params, f) {
        console.log('look for user', 'googleId', id_params.googleId)
        pool.get_client((client, done) => {
            client.query(
                'SELECT * FROM users WHERE google_id=$1 LIMIT 1',
                [ id_params.googleId ],
                (err, res) => {
                    if (err) {
                        done()
                        throw err
                    }
//                    console.log('result', res)
                    if (res.rowCount > 0) {
                        done()
                        const user = res.rows[0]
                        f(null, user)
                    } else {
                        console.log('adding user with fields', misc_params)
                        client.query(
                            'INSERT INTO users(google_id, email, given_name, family_name) VALUES ($1, $2, $3, $4) RETURNING *',
                            [ id_params.googleId, misc_params.email, misc_params.given_name, misc_params.family_name ],
                            (err, res) => {
                                done()
                                if (err) throw err
                                const user = res.rows[0]
                                f(null, user)
                            }
                        )
                    }
                }
            )
        })
    }

    static findById(id, f) {
        console.log('findById: look for user', id)
        pool.query(
            'SELECT * FROM users WHERE id=$1 LIMIT 1',
            [ id ],
            { single: true },
            (res) => {
//                console.log('result', res)
                f(null, res)
            }
        )
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
