const express = require('express');
const router = express.Router({mergeParams: true});
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const instance_storage = new Storage('instances')
const tracks_storage = new Storage('tracks')
const date_storage = new Storage('dates')
const User = require(path.join('..', 'modules', 'user'))

router.param('instance_id',
    (req, res, next, instance_id) => {
        instance_storage.get_by_id(instance_id,(ci) => {
            console.log('loaded', ci)
            req.session.instance = ci
            req.session.viewdata.instance = ci
            req.session.viewdata.ci_path = req.session.viewdata.c_path + '/instance/' + ci.id
            next()
        })
    }
)

router.use('/:instance_id/track', require('./tracks'));

function require_user(req, res, next, return_path) {
    console.log('require_user, user is', req.user)
    if (!req.user) {
        return res.redirect(return_path)
    }
    next()
}

function can_edit(req, res, next) {
    const ci = req.session.instance
    if (!User.can_edit(ci, req.user)) {
        return res.redirect('/')
    }
    console.log('can_edit', ci)
    next()
}

function can_delete(req, res, next) {
    const ci = req.session.instance
    if (!User.can_delete(ci, req.user)) {
        return res.redirect('/')
    }
    console.log('can_delete', ci)
    next()
}

function get_one(req, done) {
    console.log('instances/get_one, params =', req.params)
    const ci = req.session.instance
    date_storage.get_all_by_key(
        [ { key_name: 'instance_id', value: ci.id } ],
        { asc: 'datevalue' },
        (c_dates) => {
        console.log('ci_dates', c_dates)
        tracks_storage.get_all_by_key(
            [ { key_name: 'instance_id', value: ci.id } ],
            null,
            (list) => {
                console.log('tracks', list)
//                        list = User.public_or_mine(list, req.user)
                done(
                    Object.assign(req.session.viewdata, {
                        instance: Object.assign(ci, {dates: c_dates}),
                        tracks: list,
                        perms: {
                            can_edit: User.can_edit(ci, req.user),
                            can_delete: User.can_delete(ci, req.user)
                        },
                        user: req.user
                    })
                )
            })
    })
}

// noinspection JSUnresolvedFunction
router.get('/:instance_id', (req, res) => {
    get_one(req, (fields) => res.render('instance/show', fields))
})

// noinspection JSUnresolvedFunction
router.get('/:instance_id/edit',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        get_one(req, (fields) => res.render('instance/edit', fields))
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:instance_id',
    (req, res, next) => { can_delete(req, res, next) },
    (req, res) => {
        console.log('delete instance', req.params.instance_id)
        instance_storage.del(req.params.instance_id, () => {
            res.redirect(req.session.viewdata.c_path)
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
                res.redirect(req.session.viewdata.c_path + '/instance/' + id + '/edit');
            })
        }
    }
)

// noinspection JSUnresolvedFunction
router.put('/:instance_id',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        console.log('put with params', req.body)
        const updates = {
            year: req.body.year,
            url: req.body.url
        }
        instance_storage.update(req.params.instance_id, updates, (id) => {
            res.redirect(req.session.viewdata.c_path + '/instance/' + id);
        })
    }
)

module.exports = router;
