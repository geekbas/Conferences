const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const follow_storage = new Storage('follows')
const Following = require(path.join('..', 'modules', 'follow'))
const User = require(path.join('..', 'modules', 'user'))

router.use('/:conf_id/instance', require('./instances'));

/* GET home page. */
// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    console.log('conf list, show_all =', req.session.show_all)
//    console.log('current session:', req.session)
    conf_storage.get_all('name', (confs) => {
        confs = User.public_or_mine(confs, req.user)
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
router.get('/:id', (req, res) => {
    conf_storage.get_by_id(req.params.id,(c) => {
        console.log('show', c)
        instance_storage.get_all_by_key(
            [ { key_name: 'conf_id', value: c.id } ],
            { desc: 'year' },
            (list) => {
                list = User.public_or_mine(list, req.user)
                follow_storage.get_all_by_key(
                [
                    { key_name: 'conf_id', value: c.id },
                    { key_name: 'user_id', value: req.user ? req.user.id : null }
                ],
                { limit: 1 },
                (follows) => {
                    console.log('follow list', follows)
                    res.render('conf/show', {
                        title: 'Conference',
                        conf: c,
                        instances: list,
                        following: (follows.length > 0) ? follows[0] : null,
                        navconf: true,
                        user: req.user
                    })
                })
            })
        })
})

function require_user(req, res, next, return_path) {
    console.log('require_user, user is', req.user)
    if (!req.user) {
        return res.redirect(return_path)
    }
    next()
}

function require_public_or_mine(req, res, next, return_path) {
    conf_storage.get_by_id(req.params.id,(c) => {
        if (!User.public_or_my_obj(c, req.user)) {
            return res.redirect(return_path)
        }
        console.log('require_public_or_mine, saving conf', c)
        req.params.conf = c
        next()
    })
}

// noinspection JSUnresolvedFunction
router.get('/:id/edit',
    (req, res, next) => { require_user(req, res, next, '/') },
    (req, res, next) => { require_public_or_mine(req, res, next, '/') },
    (req, res) => {
        const c = req.params.conf
        console.log('edit conf', c)
        res.render('conf/edit', {title: 'Conference', conf: c, navconf: true, user: req.user})
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:id',
    (req, res, next) => { require_user(req, res, next, '/') },
    (req, res, next) => { require_public_or_mine(req, res, next, '/') },
    (req, res) => {
        const c = req.params.conf
        console.log('delete conf', c)
        conf_storage.del(c.id, () => {
            res.redirect('/conf');
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
                res.redirect('/conf/edit/' + id)
            })
        }
    }
)

// noinspection JSUnresolvedFunction
router.put('/:id',
    (req, res, next) => { require_user(req, res, next, '/') },
    (req, res, next) => { require_public_or_mine(req, res, next, '/') },
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
        conf_storage.update(req.params.conf.id, updates,(id) => {
            res.redirect('/conf/' + id)
        })
    }
)

module.exports = router
