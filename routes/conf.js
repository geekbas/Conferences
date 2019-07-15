const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const follow_storage = new Storage('follows')
const Following = require(path.join('..', 'modules', 'follow'))
const User = require(path.join('..', 'modules', 'user'))

router.param('conf_id',
    (req, res, next, conf_id) => {
        conf_storage.get_by_id(conf_id,(c) => {
            console.log('loaded', c)
            req.session.conf = c
            req.session.viewdata.conf = c
            req.session.viewdata.c_path = '/conf/' + c.id
            next()
        })
    }
)

router.use('/:conf_id/instance', require('./instances'));

function require_user(req, res, next, return_path) {
    console.log('require_user, user is', req.user)
    if (!req.user) {
        return res.redirect(return_path)
    }
    next()
}

function can_edit_conf(req, res, next) {
    const c = req.session.conf
    if (!User.can_edit(c, req.user)) {
        return res.redirect('/')
    }
    console.log('can_edit_conf', c)
    next()
}

function can_delete_conf(req, res, next) {
    const c = req.session.conf
    if (!User.can_delete(c, req.user)) {
        return res.redirect('/')
    }
    console.log('can_delete_conf', c)
    next()
}

/* GET home page. */
// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    console.log('conf list, show_all =', req.session.show_all)
//    console.log('current session:', req.session)
    conf_storage.get_all('name', (confs) => {
//        confs = User.public_or_mine(confs, req.user)
        Following.select_followed(
            confs,
            req.session.show_all ? null : req.user,
            'conf_id',
            [],
            (list) => {
            res.render('index', {
                title: 'Conferences',
                confs: list,
                navconf: true,
                show_all: !!req.session.show_all,
                user: req.user
            })
        })
    })
})

// noinspection JSUnresolvedFunction
router.get('/:conf_id', (req, res) => {
    const c = req.session.conf
    instance_storage.get_all_by_key(
        [ { key_name: 'conf_id', value: c.id } ],
        { desc: 'year' },
        (list) => {
//                list = User.public_or_mine(list, req.user)
            follow_storage.get_all_by_key(
            [
                { key_name: 'conf_id', value: c.id },
                { key_name: 'user_id', value: req.user ? req.user.id : null }
            ],
            { limit: 1 },
            (follows) => {
                console.log('follow list', follows)
                res.render('conf/show',
                    Object.assign(req.session.viewdata, {
                        title: 'Conference',
                        instances: list,
                        following: (follows.length > 0) ? follows[0] : null,
                        navconf: true,
                        perms: {
                            can_edit: User.can_edit(c, req.user),
                            can_delete: User.can_delete(c, req.user)
                        },
                        user: req.user
                    })
                )
            })
        })
})

// noinspection JSUnresolvedFunction
router.get('/:conf_id/edit',
    (req, res, next) => { can_edit_conf(req, res, next) },
    (req, res) => {
        const c = req.session.conf
        console.log('edit conf', c)
        res.render('conf/edit',
            Object.assign(req.session.viewdata, {
                title: 'Conference',
                navconf: true,
                user: req.user}
            )
        )
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:conf_id',
    (req, res, next) => { can_delete_conf(req, res, next) },
    (req, res) => {
        const c = req.session.conf
        console.log('delete conf', c)
        conf_storage.del(c.id, () => {
            res.redirect('/conf')
        })
    }
)

// noinspection JSUnresolvedFunction
router.post('/',
    (req, res, next) => { require_user(req, res, next, req.headers.referer) },
    (req, res) => {
        console.log('new conf with params', req.body)
        if (!req.body.empty) {
            const user_id = req.user.id
            conf_storage.add({
                acronym: req.body.acronym,
                name: req.body.name,
                added_by_user_id: user_id,
                private_for_user_id: user_id
            },(id) => {
                Following.follow(
                    req.user,
                    { conf_id: id },
                    (id) => res.redirect('/conf/' + id))
            })
        }
    }
)

// noinspection JSUnresolvedFunction
router.put('/:conf_id',
    (req, res, next) => { can_edit_conf(req, res, next) },
    (req, res) => {
        const params = req.body
        console.log('update conf / with params', params)
        const updates = {
            name: params.name,
            acronym: params.acronym,
            url: params.url,
            format: params.format,
            acceptance_rate: params.acceptance_rate
        }
        conf_storage.update(req.session.conf.id, updates,(id) => {
            res.redirect('/conf/' + id)
        })
    }
)

module.exports = router
