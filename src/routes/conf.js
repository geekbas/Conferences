var express = require('express');
var router = express.Router();
var path = require('path');
var confs = require(path.join('..', 'modules', 'conf'));

/* GET home page. */
router.get('/', (req, res) => {
    confs.get((confs) => {
        res.render('index', {title: 'Conferences', confs });
    });
});

router.get('/:id', (req, res) => {
    confs.get_by_id(req.params.id,(c) => {
        console.log('show', c);
        res.render('conf', {title: 'Conference', conf: c})
    });
});

router.get('/edit/:id', (req, res) => {
    confs.get_by_id(req.params.id,(c) => {
        console.log('show', c);
        res.render('conf-edit', {title: 'Conference', conf: c})
    });
});

router.delete('/:id', (req, res) => {
    console.log('delete conf', req.params.id);
    confs.delete(req.params.id, () => {
        res.redirect('/conf');
    })
});

router.post('/', (req, res) => {
    console.log('post conf / with params', req.body);
    if (!req.body.empty) {
        confs.add(req.body.name, (doc) => {
//            console.log('created:', doc);
            // TODO: to the new entry
            res.redirect('/conf');
        })
    }
});

router.put('/', (req, res) => {
    console.log('put conf / with params', req.body);
    confs.update(req.body, (c) => {
        console.log('show', c);
        res.redirect('/conf/' + c.id);
    });
});

module.exports = router;
