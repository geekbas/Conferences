const express = require('express');
const router = express.Router({mergeParams: true});
const path = require('path');

const Track = require(path.join('..', 'modules', 'track'))
const User = require(path.join('..', 'modules', 'user'))
const Submission = require(path.join('..', 'modules', 'submission'))
const helpers = require('./helpers')

router.param('submission_id',
    (req, res, next, submission_id) => {
        Submission.get_by_id(submission_id, (submission) => {
            console.log('loaded submission', submission)
            req.session.submission = submission
            req.session.viewdata.submission = submission
            req.session.viewdata.submission_path = req.session.viewdata.track_path + '/submission/' + submission.id
            next()
        })
    }
)

function require_same_user(req, res, next, return_path) {
//    console.log('require_same_user, user is', req.user)
    if (!req.user || (req.user.id !== req.session.submission.user_id)) {
        return res.redirect(return_path)
    }
    next()
}

function get_one(req, done) {
    const submission = req.session.submission
    let options = {}
    if (req.session.track.notification)
        options.after = req.session.track.notification

    Track.find_upcoming(req.user.id, options, (tracks) => {
        const upcoming = helpers.add_paths(tracks)

        Track.find_upcoming(req.user.id, null, (tracks2) => {
            const alternatives = helpers.add_paths(tracks2).
                filter((e) => { return e.track_id !== req.session.track.id })

            done(Object.assign(req.session.viewdata, {
                submission,
                upcoming,
                alternatives,
                user: req.user
            }))
        })
    })
}

// noinspection JSUnresolvedFunction
router.get('/:submission_id',
    (req, res, next) => { require_same_user(req, res, next, req.session.viewdata.track_path) },
    (req, res) => {
        get_one(req, (items) => res.render('submission/show', items))
    }
)

// noinspection JSUnresolvedFunction
router.get('/:submission_id/edit',
    (req, res, next) => { require_same_user(req, res, next, req.session.viewdata.track_path) },
    (req, res) => {
        get_one(req, (items) => res.render('submission/edit', items))
    }
)

router.put('/:submission_id',
    (req, res, next) => { require_same_user(req, res, next, req.session.viewdata.track_path) },
    (req, res) => {
        console.log('put with params', req.body)
        const updates = {
            title: req.body.title,
            url: req.body.url,
        }
        Submission.update(req.params.submission_id, updates, (id) => {
            res.redirect(req.session.viewdata.track_path + '/submission/' + id)
        })
    }
)

router.put('/:submission_id/track_id',
    (req, res, next) => { require_same_user(req, res, next, req.session.viewdata.track_path) },
    (req, res) => {
        const track_id = req.body.track_id
        console.log('change track to', track_id)
        const updates = { track_id }
        Submission.update(req.params.submission_id, updates, (id) => {
            res.redirect(
                '/conf/' + req.body.conf_id +
                '/instance/' + req.body.instance_id +
                '/track/' + track_id +
                '/submission/' + id)
        })
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:submission_id',
    (req, res, next) => { require_same_user(req, res, next, req.session.viewdata.track_path) },
    (req, res) => {
        console.log('delete submission', req.params.submission_id)
        Submission.del(req.params.submission_id, () => {
            res.redirect(req.session.viewdata.track_path)
        })
    }
)

module.exports = router
