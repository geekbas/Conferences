var express = require('express');
var router = express.Router();
var confs = require('../modules/conf');

/* GET home page. */
router.get('/', function(req, res, next) {
    confs.get({}, (confs) => {
        res.render('index', {title: 'Conferences', confs });
    });
});

router.get('/:id', function(req, res, next) {
    confs.get_by_id(req.params.id,(c) => {
        res.render('conf', {title: 'Conference', conf: {id: c.id, name: c.name, acronym: c.acronym}})
    });
});

module.exports = router;
