const express = require('express');
const router = express.Router();
const path = require('path');
const db_t = require(path.join('..', 'modules', 'track'));
const db_i = require(path.join('..', 'modules', 'instance'));
const db_c = require(path.join('..', 'modules', 'conf'));

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('tracks.post with params', req.body);
    if (!req.body.empty) {
        db_t.add(req.body.instance_id, req.body.name, (track) => {
            res.redirect('/track/edit/' + track.id);
        })
    }
});

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    db_t.get_by_id(req.params.id, (track) => {
        console.log('show', track);
        db_i.get_by_id(track.instance_id, (ci, list) => {
            db_c.get_by_id(ci.conf_id, (c, list) => {
                console.log('conference', c);
                res.render('track/show', {track: track, instance: ci, conf: c});
            });
        });
    });
});

// noinspection JSUnresolvedFunction
router.get('/edit/:id', (req, res) => {
    db_t.get_by_id(req.params.id, (track) => {
        console.log('show', track);
        db_i.get_by_id(track.instance_id, (ci, list) => {
            console.log('instance', ci);
            db_c.get_by_id(ci.conf_id, (c, list) => {
                console.log('conference', c);
                res.render('track/edit', {track: track, instance: ci, conf: c});
            });
        });
    });
});

// noinspection JSUnresolvedFunction
router.put('/', (req, res) => {
    console.log('put with params', req.body);
    let updates = {};
    if (req.body.name) {
        updates = Object.assign(updates, { name: req.body.name });
    }
    if (req.body.url) {
        updates = Object.assign(updates, { url: req.body.url });
    }
    if (req.body.page_limit) {
        updates = Object.assign(updates, { page_limit: req.body.page_limit });
    }
    updates = Object.assign(updates, { including_references: !!req.body.including_references});
    updates = Object.assign(updates, { double_blind: !!req.body.double_blind});
    db_t.update(req.body.id, updates, (track) => {
        console.log('show', track);
        res.redirect('/track/' + track.id);
    });
});

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete track', req.body.id);
    db_t.delete(req.body.id, () => {
        res.redirect('/instance/' + req.body.instance_id);
    })
});

module.exports = router;
