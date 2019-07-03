var express = require('express');
var router = express.Router();
var path = require('path');
var dbi = require(path.join('..', 'modules', 'instance'));
var confs = require(path.join('..', 'modules', 'conf'));

router.get('/:id', (req, res) => {
    dbi.get_by_id(req.params.id,(ci) => {
        console.log('show', ci);
        confs.get_by_id(ci.conf_id, (c, list) => {
            res.render('instance', {title: 'Conference Instance', instance: ci, conf: c})
        });
    });
});

router.get('/edit/:id', (req, res) => {
    dbi.get_by_id(req.params.id,(obj) => {
        console.log('show', obj);
        confs.get_by_id(obj.conf_id, (c, list) => {
            res.render('instance-edit', {title: 'Conference Instance', instance: obj, conf: c})
        });
    });
});

router.post('/', (req, res) => {
    console.log('post with params', req.body);
    if (!req.body.empty) {
        dbi.add(req.body.conf_id, req.body.year, (doc) => {
//            console.log('created:', doc);
            res.redirect('/instance/edit/' + doc.id);
        })
    }
});

router.put('/', (req, res) => {
    console.log('put with params', req.body);
    dbi.update(req.body, (ci) => {
        console.log('show', ci);
        res.redirect('/instance/' + ci.id);
    });
});

module.exports = router;
