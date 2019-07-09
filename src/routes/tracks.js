const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')
const tracks_storage = new Storage('tracks')
const date_storage = new Storage('dates')

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('tracks.post with params', req.body)
    if (!req.body.empty) {
        tracks_storage.add({
            instance_id: req.body.instance_id,
            name: req.body.name
        }, (id) => {
            res.redirect('/track/edit/' + id)
        })
    }
})

function get_one(req, view, res) {
    const id = req.params.id
    tracks_storage.get_by_id(id, (track) => {
        console.log('show', track)
        date_storage.get_all_by_key('track_id', id, { asc: 'datevalue' }, (dates) => {
            instance_storage.get_by_id(track.instance_id, (ci) => {
                console.log('instance', ci)
                conf_storage.get_by_id(ci.conf_id, (c) => {
                    console.log('conference', c)
                    res.render('track/' + view, {
                        track: Object.assign(track, { dates }),
                        instance: ci,
                        conf: c,
                        user: req.user
                    })
                })
            })
        })
    })
}

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    get_one(req, 'show', res)
})

// noinspection JSUnresolvedFunction
router.get('/edit/:id', (req, res) => {
    get_one(req, 'edit', res)
})

// noinspection JSUnresolvedFunction
router.put('/', (req, res) => {
    console.log('put with params', req.body)
    const updates = {
        name: req.body.name,
        url: req.body.url,
        page_limit: req.body.page_limit,
        including_references: !!req.body.including_references,
        double_blind: !!req.body.double_blind
    }
    tracks_storage.update(req.body.id, updates, (id) => {
        res.redirect('/track/' + id)
    })
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete track', req.params.id)
    tracks_storage.del(req.params.id, (track) => {
        res.redirect('/instance/' + track.instance_id)
    })
})

module.exports = router
