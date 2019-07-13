const express = require('express');
const router = express.Router({mergeParams: true});
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const tracks_storage = new Storage('tracks')
const date_storage = new Storage('dates')
const User = require(path.join('..', 'modules', 'user'))

function get_one(req, done, on_reject) {
    console.log('instances/get_one, params =', req.params)
    const id = req.params.id
    instance_storage.get_by_id(id, (ci) => {
        console.log('show', ci)
        if (!User.public_or_my_obj(ci, req.user)) { return on_reject() }
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
                        list = User.public_or_mine(list, req.user)
                        done({
                                conf: c,
                                instance: Object.assign(ci, {dates: c_dates}),
                                tracks: list,
//                                following: (follows.length > 0) ? follows[0] : null,
                                user: req.user
                            })
                    })
            })
        })
    })
}

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    get_one(req,
        (items) => res.render('instance/show', items),
        () => res.redirect('/'))
})

// noinspection JSUnresolvedFunction
router.get('/:id/edit', (req, res) => {
    if (!req.user) {
        return res.redirect('/')
    }
    get_one(req,
        (items) => res.render('instance/edit', items),
        () => res.redirect('/'))
})

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('post with params', req.body)
    if (!req.user) {
        return res.redirect(req.headers.referer)
    }
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
})

// noinspection JSUnresolvedFunction
router.put('/', (req, res) => {
    console.log('put with params', req.body)
    const updates = {
        year: req.body.year,
        url: req.body.url
    }
    instance_storage.update(req.body.id, updates, (id) => {
        res.redirect('/conf/' + req.params.conf_id + '/instance/' + id);
    })
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete instance', req.params.id)
    instance_storage.del(req.params.id, () => {
        res.redirect('/conf/' + req.params.conf_id)
    })
})

module.exports = router;
