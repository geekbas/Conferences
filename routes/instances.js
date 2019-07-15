const express = require('express');
const router = express.Router({mergeParams: true});
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const tracks_storage = new Storage('tracks')
const date_storage = new Storage('dates')
const User = require(path.join('..', 'modules', 'user'))

router.use('/:instance_id/track', require('./tracks'));

function require_user(req, res, next, return_path) {
    console.log('require_user, user is', req.user)
    if (!req.user) {
        return res.redirect(return_path)
    }
    next()
}

function can_edit(req, res, next) {
    instance_storage.get_by_id(req.params.id,(ci) => {
        if (!User.can_edit(ci, req.user)) {
            return res.redirect('/')
        }
        console.log('can_edit', ci)
        req.params.instance = ci
        next()
    })
}

function can_delete(req, res, next) {
    instance_storage.get_by_id(req.params.id,(ci) => {
        if (!User.can_delete(ci, req.user)) {
            return res.redirect('/')
        }
        console.log('can_delete', ci)
        req.params.instance = ci
        next()
    })
}

function get_one(req, done) {
    console.log('instances/get_one, params =', req.params)
    const id = req.params.id
    instance_storage.get_by_id(id, (ci) => {
        console.log('show', ci)
        date_storage.get_all_by_key(
            [ { key_name: 'instance_id', value: ci.id } ],
            { asc: 'datevalue' },
            (c_dates) => {
            console.log('ci_dates', c_dates)
            conf_storage.get_by_id(req.params.conf_id, (c) => {
                tracks_storage.get_all_by_key(
                    [ { key_name: 'instance_id', value: ci.id } ],
                    null,
                    (list) => {
                        console.log('tracks', list)
//                        list = User.public_or_mine(list, req.user)
                        done({
                                conf: c,
                                instance: Object.assign(ci, {dates: c_dates}),
                                tracks: list,
//                                following: (follows.length > 0) ? follows[0] : null,
                                perms: {
                                    can_edit: User.can_edit(ci, req.user),
                                    can_delete: User.can_delete(ci, req.user)
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
    get_one(req, (fields) => res.render('instance/show', fields))
})

// noinspection JSUnresolvedFunction
router.get('/:id/edit',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        get_one(req, (fields) => res.render('instance/edit', fields))
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:id',
    (req, res, next) => { can_delete(req, res, next) },
    (req, res) => {
        console.log('delete instance', req.params.id)
        instance_storage.del(req.params.id, () => {
            res.redirect('/conf/' + req.params.conf_id)
        })
    }
)

// noinspection JSUnresolvedFunction
router.post('/',
    (req, res, next) => { require_user(req, res, next, req.headers.referer) },
    (req, res) => {
        console.log('post with params', req.body)
        if (!req.body.empty) {
            const user_id = req.user.id
            const conf_id = req.params.conf_id
            instance_storage.add({
                conf_id: conf_id,
                year: req.body.year,
                added_by_user_id: user_id,
                private_for_user_id: user_id
            }, (id) => {
                res.redirect('/conf/' + conf_id + '/instance/' + id + '/edit');
            })
        }
    }
)

// noinspection JSUnresolvedFunction
router.put('/:id',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        console.log('put with params', req.body)
        const updates = {
            year: req.body.year,
            url: req.body.url
        }
        instance_storage.update(req.params.id, updates, (id) => {
            res.redirect('/conf/' + req.params.conf_id + '/instance/' + id);
        })
    }
)

module.exports = router;
