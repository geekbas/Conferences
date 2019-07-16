var express = require('express');
var router = express.Router();
const path = require('path');
const Storage = require(path.join('..', 'modules', 'storage'))
const follow_storage = new Storage('follows')
const conf_storage = new Storage('confs')
//const User = require(path.join('..', 'modules', 'user'))

function load_all_confs(done) {
    let confs = []
    conf_storage.get_all(null, (clist) => {
        clist.forEach((entry) => confs[entry.id] = entry)
        done(confs)
    })
}

router.get('/',
    (req, res) => {
        if (!req.user) { return res.redirect('/') }
        load_all_confs((confs) => {
            follow_storage.get_all_by_key(
                [
                    { key_name: 'user_id', value: req.user.id }
                ],
                { },
                (follows) => {
                    console.log('follow list', follows)
                    let followed_confs = []
                    follows.forEach((f) => {
                        if (f.conf_id !== undefined) {
                            f.conf = confs[f.conf_id]
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
