var express = require('express');
var router = express.Router();

// TODO: to db.js
var admin = require('firebase-admin');
var serviceAccount = require("./conferences-77da0-firebase-adminsdk-eht10-e246d33a60.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://conferences-77da0.firebaseio.com"
});
var db = admin.firestore();

// TODO: to modules/conf.js
// ...

/* GET home page. */
router.get('/', function(req, res, next) {
    db.collection('confs').get().then((snapshot) => {
        var confs = []
        snapshot.docs.map((entry) => {
            console.log(entry.id, entry.data());
            var d = entry.data();
            confs.push({id : entry.id, name : d.name, acronym : d.acronym})
        })
        console.log('sending:', confs)
        res.render('index', {title: 'Conferences', confs });
    });
});

router.get('/:id', function(req, res, next) {
    db.collection('confs').get({id: req.params.id}).then((snapshot) => {
        snapshot.docs.map((entry) => {
            console.log(entry.id, entry.data());
            var d = entry.data();
            res.render('conf', {title: 'Conference', conf: {id: entry.id, name: d.name, acronym: d.acronym}})
        });
    });
});

module.exports = router;
