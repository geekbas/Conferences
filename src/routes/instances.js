const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const tracks_storage = new Storage('tracks')
const date_storage = new Storage('dates')

function get_one(id, view, res) {
    instance_storage.get_by_id(id, (ci) => {
        console.log('show', ci)
        date_storage.get_all_by_key('instance_id', ci.id, { asc: 'datevalue' }, (c_dates) => {
            console.log('ci_dates', c_dates)
            conf_storage.get_by_id(ci.conf_id, (c) => {
                tracks_storage.get_all_by_key('instance_id', ci.id, null, (list) => {
                    console.log('tracks', list)
                    res.render('instance/' + view, {
                        conf: c,
                        instance: Object.assign(ci, { dates: c_dates }),
                        tracks: list
                    })
                })
            })
        })
    })

}

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    get_one(req.params.id, 'show', res)
})

// noinspection JSUnresolvedFunction
router.get('/edit/:id', (req, res) => {
    get_one(req.params.id, 'edit', res)
})

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('post with params', req.body)
    if (!req.body.empty) {
        instance_storage.add({
            conf_id: req.body.conf_id,
            year: req.body.year
        }, (id) => {
            res.redirect('/instance/edit/' + id);
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
        res.redirect('/instance/' + id);
    })
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete instance', req.params.id)
    instance_storage.del(req.params.id, () => {
        res.redirect('/conf/' + req.body.conf_id)
    })
})

module.exports = router;
