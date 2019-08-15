const express = require('express');
const router = express.Router();
const path = require('path');

const Conf = require(path.join('..', 'modules', 'conf'))
const Instance = require(path.join('..', 'modules', 'instance'))
const Following = require(path.join('..', 'modules', 'follow'))
const User = require(path.join('..', 'modules', 'user'))

const helpers = require('./helpers')

router.param('conf_id',
    (req, res, next, conf_id) => {
        Conf.get_by_id(conf_id,(c) => {
            console.log('loaded conf', c)
            req.session.conf = c
            req.session.viewdata.navsection = 'confs'
            req.session.viewdata.conf = c
            req.session.viewdata.c_path = '/conf/' + c.id
            next()
        })
    }
)

router.use('/:conf_id/instance', require('./instances'));

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
    let options = { as_array: true }
    const show_all = req.session.show_all || req.query.show_all
    if (!show_all && req.user)
        options.followed_by = req.user.id
    Conf.get_all(options, (confs) => {
//        console.log('got full conf list', confs)
        res.render('index', {
            title: 'Conferences',
            confs: confs,
            navsection: 'confs',
            show_all: !!show_all,
            user: req.user
        })
    })
})

// noinspection JSUnresolvedFunction
router.get('/:conf_id', (req, res) => {
    const c = req.session.conf
    console.log('show', c)
    Instance.get_all(c.id, (list) => {
        console.log('instances', list)
//                list = User.public_or_mine(list, req.user)
        Following.follows_conf(req.user ? req.user.id : null, c.id, (follows) => {
            res.render('conf/show',
                Object.assign(req.session.viewdata, {
                    title: 'Conference',
                    instances: list,
                    following: follows,
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
        Conf.del(c.id, () => {
            res.redirect('/conf')
        })
    }
)

// noinspection JSUnresolvedFunction
router.post('/',
    (req, res, next) => { helpers.require_user(req, res, next, req.headers.referer) },
    (req, res) => {
        console.log('new conf with params', req.body)
        if (!req.body.empty) {
            const user_id = req.user.id
            Conf.add({
                acronym: req.body.acronym,
                name: req.body.name,
                added_by_user_id: user_id,
            }, (conf_id) => {
                console.log('router got conf_id', conf_id)
                Following.follow(
                    req.user,
                    conf_id,
                    () => res.redirect('/conf/' + conf_id))
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
        Conf.update(req.session.conf.id, params,(id) => {
            res.redirect('/conf/' + id)
        })
    }
)

module.exports = router
