var express = require('express');
var router = express.Router();
const path = require('path');
const Conf = require(path.join('..', 'modules', 'conf'))
//const User = require(path.join('..', 'modules', 'user'))

router.get('/',
    (req, res, next) => {
        if (!req.user) { return res.redirect('/') }
        next()
    },
    (req, res) => {
        Conf.get_all({ followed_by: req.user.id, as_array: true }, (confs) => {
            console.log('confs', confs)
            res.render('profile', {
                user: req.user,
                confs: confs
            })
        })
    }
)

module.exports = router;
