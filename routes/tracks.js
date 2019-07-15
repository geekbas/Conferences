const express = require('express');
const router = express.Router({mergeParams: true});
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const tracks_storage = new Storage('tracks')
const date_storage = new Storage('dates')
const User = require(path.join('..', 'modules', 'user'))

function require_user(req, res, next, return_path) {
    console.log('require_user, user is', req.user)
    if (!req.user) {
        return res.redirect(return_path)
    }
    next()
}

function can_edit(req, res, next) {
    tracks_storage.get_by_id(req.params.id,(obj) => {
        if (!User.can_edit(obj, req.user)) {
            return res.redirect('/')
        }
        console.log('can_edit', obj)
        req.params.track = obj
        next()
    })
}

function can_delete(req, res, next) {
    tracks_storage.get_by_id(req.params.id,(obj) => {
        if (!User.can_delete(obj, req.user)) {
            return res.redirect('/')
        }
        console.log('can_delete', obj)
        req.params.track = obj
        next()
    })
}

// noinspection JSUnresolvedFunction
router.post('/',
    (req, res, next) => { require_user(req, res, next, req.headers.referer) },
    (req, res) => {
        console.log('tracks.post with body', req.body, 'and params', req.params)
        if (!req.body.empty) {
            const user_id = req.user.id
            const conf_id = req.params.conf_id
            const instance_id = req.params.instance_id
            tracks_storage.add({
                instance_id: instance_id,
                name: req.body.name,
                added_by_user_id: user_id,
                private_for_user_id: user_id
            }, (id) => {
                res.redirect('/conf/' + conf_id + '/instance/' + instance_id + '/track/' + id + '/edit')
            })
        }
    }
)

function get_one(req, done) {
    const id = req.params.id
    tracks_storage.get_by_id(id, (track) => {
        console.log('show', track)
        date_storage.get_all_by_key(
            [ { key_name: 'track_id', value: id } ],
            { asc: 'datevalue' },
            (dates) => {
            instance_storage.get_by_id(track.instance_id, (ci) => {
                console.log('instance', ci)
                conf_storage.get_by_id(ci.conf_id, (conf) => {
                    console.log('conference', conf)
                    done({
                        track: Object.assign(track, { dates }),
                        conf: conf,
                        instance: ci,
                        c_path: '/conf/' + conf.id,
                        ci_path: '/conf/' + conf.id + '/instance/' + ci.id,
                        track_path: '/conf/' + conf.id + '/instance/' + ci.id + '/track/' + track.id,
                        perms: {
                            can_edit: User.can_edit(track, req.user),
                            can_delete: User.can_delete(track, req.user)
                        },
                        user: req.user
                    })
                })
            })
        })
    })
}

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    get_one(req, (items) => res.render('track/show', items))
})

// noinspection JSUnresolvedFunction
router.get('/:id/edit',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        get_one(req, (items) => res.render('track/edit', items))
    }
)

// noinspection JSUnresolvedFunction
router.put('/:id',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        console.log('put with params', req.body)
        const updates = {
            name: req.body.name,
            url: req.body.url,
            page_limit: req.body.page_limit,
            including_references: !!req.body.including_references,
            double_blind: !!req.body.double_blind
        }
        tracks_storage.update(req.params.id, updates, (id) => {
            res.redirect('/conf/' + req.params.conf_id + '/instance/' + req.params.instance_id + '/track/' + id)
        })
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:id',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        console.log('delete track', req.params.id)
        tracks_storage.del(req.params.id, (track) => {
            res.redirect('/conf/' + req.params.conf_id + '/instance/' + req.params.instance_id)
        })
    }
)

module.exports = router
