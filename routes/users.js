var express = require('express');
var router = express.Router();
const path = require('path');
const Storage = require(path.join('..', 'modules', 'storage'))
const follow_storage = new Storage('follows')
const Conf = require(path.join('..', 'modules', 'conf'))
//const User = require(path.join('..', 'modules', 'user'))

router.get('/',
    (req, res, next) => {
        if (!req.user) { return res.redirect('/') }
        next()
    },
    (req, res) => {
        Conf.get_all({ as_array: true }, (confs) => {
            follow_storage.get_all_by_key(
                [
                    {key_name: 'user_id', value: req.user.id}
                ],
                {},
                (follows) => {
                    console.log('follow list', follows)
                    let followed_confs = []
                    follows.forEach((f) => {
                        if (f.conf_id !== undefined) {
                            f.conf = confs[f.conf_id]
                            if (f.conf !== undefined)
                                followed_confs.push(f)
                        }
                    })
                    console.log('confs', followed_confs)
                    res.render('profile', {
                        user: req.user,
                        confs: followed_confs
                    })
                }
            )
        })
    }
)

module.exports = router;
