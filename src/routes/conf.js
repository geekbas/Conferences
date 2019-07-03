var express = require('express');
var router = express.Router();
var confs = require('../modules/conf');

/* GET home page. */
router.get('/', function(req, res) {
    confs.get((confs) => {
        res.render('index', {title: 'Conferences', confs });
    });
});

router.get('/:id', function(req, res) {
    confs.get_by_id(req.params.id,(c) => {
        console.log('show', c);
        res.render('conf', {title: 'Conference', conf: {id: c.id, name: c.name, acronym: c.acronym}})
    });
});

router.delete('/:id', function(req, res) {
    console.log('delete conf', req.params.id);
    confs.delete(req.params.id, () => {
        res.redirect('/conf');
    })
});

router.post('/', function(req, res) {
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
