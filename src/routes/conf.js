const express = require('express');
const router = express.Router();
const path = require('path');
const confs = require(path.join('..', 'modules', 'conf'));

/* GET home page. */
// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    confs.get((confs) => {
        res.render('index', {title: 'Conferences', confs });
    });
});

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    confs.get_by_id(req.params.id,(c, ci) => {
        console.log('show', c, ci);
        res.render('conf/show', {title: 'Conference', conf: c, instances: ci})
    });
});

// noinspection JSUnresolvedFunction
router.get('/edit/:id', (req, res) => {
    confs.get_by_id(req.params.id,(c) => {
        console.log('show', c);
        res.render('conf/edit', {title: 'Conference', conf: c})
    });
});

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete conf', req.params.id);
    confs.delete(req.params.id, () => {
        res.redirect('/conf');
    })
});

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('post conf / with params', req.body);
    if (!req.body.empty) {
        confs.add(req.body.name, (c) => {
            console.log('created:', c);
            res.redirect('/conf/edit/' + c.id);
        })
    }
});

// noinspection JSUnresolvedFunction
router.put('/', (req, res) => {
    console.log('put conf / with params', req.body);
    confs.update(req.body, (c) => {
        console.log('show', c);
        res.redirect('/conf/' + c.id);
    });
});

module.exports = router;
