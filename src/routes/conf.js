const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const follow_storage = new Storage('follows')

function select_followed(list, user, filtered_list, done) {
    if (!user) {
        console.log('no filter')
        return done(list)
    }
    if (list.length < 1) {
        return done(filtered_list)
    }
    const c = list[0]
//    console.log('check', c)
    follow_storage.get_all_by_key(
        [
            { key_name: 'conf_id', value: c.id },
            { key_name: 'user_id', value: user.id }
        ],
        { limit: 1 },
        (follows) => {
//            console.log('follows = ', follows)
            if (follows.length > 0) {
                return select_followed(list.slice(1), user, filtered_list.concat([ c ]), done)
            } else {
                return select_followed(list.slice(1), user, filtered_list, done)
            }
        })
}

/* GET home page. */
// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    console.log('conf list, show_all =', req.session.show_all)
    conf_storage.get_all('name', (confs) => {
        select_followed(confs, req.session.show_all ? null : req.user, [], (list) => {
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

// noinspection JSUnresolvedFunction
router.get('/edit/:id', (req, res) => {
    conf_storage.get_by_id(req.params.id,(c) => {
        console.log('edit', c)
        res.render('conf/edit', {title: 'Conference', conf: c, navconf: true, user: req.user})
    })
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete conf', req.params.id)
    conf_storage.del(req.params.id, () => {
        res.redirect('/conf');
    })
})

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('new conf with params', req.body)
    if (!req.body.empty) {
        conf_storage.add({
            acronym: req.body.acronym,
            name: req.body.name
        },(id) => {
            res.redirect('/conf/edit/' + id)
        })
    }
})

// noinspection JSUnresolvedFunction
router.put('/', (req, res) => {
    const params = req.body
    console.log('put conf / with params', params)
    const updates = {
        name: params.name,
        acronym: params.acronym,
        url: params.url,
        format: params.format,
        acceptance_rate: params.acceptance_rate
    }
    conf_storage.update(req.body.id, updates,(id) => {
        res.redirect('/conf/' + id)
    })
})

router.post('/filter', (req, res) => {
    console.log('filter', req.body)
    req.session.show_all = !!req.body.show_all
    res.redirect('/')
})

module.exports = router
