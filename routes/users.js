var express = require('express');
var router = express.Router();
const path = require('path');
const Conf = require(path.join('..', 'modules', 'conf'))
const Submission = require(path.join('..', 'modules', 'submission'))
const Track = require(path.join('..', 'modules', 'track'))
const User = require(path.join('..', 'modules', 'user'))

const helpers = require('./helpers')

router.get('/',
    (req, res, next) => {
        if (!req.user) { return res.redirect('/') }
        next()
    },
    (req, res) => {
        Conf.get_all({ followed_by: req.user.id, as_array: true }, (confs) => {
            Submission.get_all_mine(req.user.id, (submissions) => {
                const papers = helpers.add_paths(submissions)
                Track.find_upcoming(req.user.id, null, (tracks) => {
                    const upcoming = helpers.add_paths(tracks)
                    res.render('user/profile', {
                        navsection: 'profile',
                        user: req.user,
                        confs,
                        submissions: papers,
                        upcoming,
                    })
                })
            })
        })
    }
)

router.get('/list',
    (req, res, next) => { helpers.require_admin(req, res, next, '/') },
    (req, res) => {
        User.find_all((users) => {
            res.render('user/users', {
                navsection: 'users',
                user: req.user,
                users,
            })
        })
    }
)

router.put('/:user_id',
    (req, res, next) => { helpers.require_admin(req, res, next, '/') },
    (req, res) => {
        User.update(req.params.user_id, req.body, (id) => {
            res.redirect(req.headers.referer)
        })
    }
)

module.exports = router;
