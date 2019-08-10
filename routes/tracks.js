const express = require('express');
const router = express.Router({mergeParams: true});
const path = require('path');

const Track = require(path.join('..', 'modules', 'track'))
const User = require(path.join('..', 'modules', 'user'))
const Submission = require(path.join('..', 'modules', 'submission'))

const helpers = require('./helpers')

router.param('track_id',
    (req, res, next, track_id) => {
        Track.get_by_id(track_id, (track) => {
            console.log('loaded track', track)
            req.session.track = track
            req.session.viewdata.track = track
            req.session.viewdata.track_path = req.session.viewdata.ci_path + '/track/' + track.id
            next()
        })
    }
)

router.use('/:track_id/submission', require('./submissions'));

function can_edit(req, res, next) {
    const obj = req.session.track
    if (!User.can_edit(obj, req.user)) {
        return res.redirect('/')
    }
    console.log('can_edit', obj)
    next()
}

function can_delete(req, res, next) {
    const obj = req.session.track
    if (!User.can_delete(obj, req.user)) {
        return res.redirect('/')
    }
    console.log('can_delete', obj)
    next()
}

// noinspection JSUnresolvedFunction
router.post('/',
    (req, res, next) => { helpers.require_user(req, res, next, req.headers.referer) },
    (req, res) => {
        console.log('tracks.post with body', req.body, 'and params', req.params)
        if (!req.body.empty) {
            const user_id = req.user.id
            const instance_id = req.params.instance_id
            Track.add({
                instance_id: instance_id,
                name: req.body.name,
                added_by_user_id: user_id,
            }, (id) => {
                res.redirect(req.session.viewdata.ci_path + '/track/' + id + '/edit')
            })
        }
    }
)

function get_one(req, done) {
    const track = req.session.track
    Submission.get_all(req.user ? req.user.id : null, track.id, (submissions) => {
        done(Object.assign(req.session.viewdata, {
            track: track,
            submissions,
            perms: {
                can_edit: User.can_edit(track, req.user),
                can_delete: User.can_delete(track, req.user)
            },
            user: req.user
        }))
    })
}

// noinspection JSUnresolvedFunction
router.get('/:track_id', (req, res) => {
    get_one(req, (items) => res.render('track/show', items))
})

// noinspection JSUnresolvedFunction
router.get('/:track_id/edit',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        get_one(req, (items) => res.render('track/edit', items))
    }
)

// noinspection JSUnresolvedFunction
router.put('/:track_id',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        console.log('put with params', req.body)
        const updates = {
            name: req.body.name,
            url: req.body.url,
            page_limit: 0 + req.body.page_limit,
            including_references: !!req.body.including_references,
            double_blind: !!req.body.double_blind,
            submission: req.body.submission,
            notification: req.body.notification,
            camera_ready: req.body.camera_ready,
        }
        Track.update(req.params.track_id, updates, (id) => {
            res.redirect(req.session.viewdata.ci_path + '/track/' + id)
        })
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:track_id',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        console.log('delete track', req.params.track_id)
        Track.del(req.params.track_id, () => {
            res.redirect(req.session.viewdata.ci_path)
        })
    }
)

module.exports = router
