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
        res.render('conf', {title: 'Conference', conf: {id: c.id, name: c.name, acronym: c.acronym}})
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

module.exports = router;
