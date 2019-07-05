const express = require('express');
const router = express.Router();
const path = require('path');
const dbi = require(path.join('..', 'modules', 'instance'));
const confs = require(path.join('..', 'modules', 'conf'));
const db_t = require(path.join('..', 'modules', 'track'));

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    dbi.get_by_id(req.params.id,(ci) => {
        console.log('show', ci);
        confs.get_by_id(ci.conf_id, (c, list) => {
            db_t.get_for_instance(ci.id, (list) => {
                console.log('tracks', list);
                res.render('instance/show', {instance: ci, conf: c, tracks: list})
            });
        });
    });
});

// noinspection JSUnresolvedFunction
router.get('/edit/:id', (req, res) => {
    dbi.get_by_id(req.params.id,(ci) => {
        console.log('show', ci);
        confs.get_by_id(ci.conf_id, (c, list) => {
            console.log('conference', c);
            db_t.get_for_instance(ci.id, (list) => {
                console.log('tracks', list);
                res.render('instance/edit', {instance: ci, conf: c, tracks: list})
            });
        });
    });
});

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('post with params', req.body);
    if (!req.body.empty) {
        dbi.add(req.body.conf_id, req.body.year, (ci) => {
            console.log('created:', ci);
            res.redirect('/instance/edit/' + ci.id);
        })
    }
});

// noinspection JSUnresolvedFunction
router.put('/', (req, res) => {
    console.log('put with params', req.body);
    dbi.update(req.body, (ci) => {
        console.log('show', ci);
        res.redirect('/instance/' + ci.id);
    });
});

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete instance', req.body.id);
    dbi.delete(req.body.id, () => {
        res.redirect('/conf/' + req.body.conf_id);
    })
});

module.exports = router;
