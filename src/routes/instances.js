const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const tracks_storage = new Storage('tracks')

function get_one(id, view, res) {
    instance_storage.get_by_id(id,(ci) => {
        console.log('show', ci)
        conf_storage.get_by_id(ci.conf_id,(c) => {
            tracks_storage.get_all_by_key('instance_id', ci.id, null, (list) => {
                console.log('tracks', list)
                res.render('instance/' + view, {instance: ci, conf: c, tracks: list})
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
    console.log('delete instance', req.body.id)
    instance_storage.del(req.body.id, () => {
        res.redirect('/conf/' + req.body.conf_id)
    })
})

module.exports = router;
