var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
    fs.readFile( __dirname + "/" + "confs.json", 'utf8', function (err, data) {
        var confs = JSON.parse(data);
        res.render('index', {title: 'Conferences', confs: confs});
    });
});

router.get('/:id', function(req, res, next) {
    fs.readFile( __dirname + "/" + "confs.json", 'utf8', function (err, data) {
        var confs = JSON.parse(data);
        res.render('conf', {title: 'Conference', conf: confs[req.params.id]});
    });
});

module.exports = router;
