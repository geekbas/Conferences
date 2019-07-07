const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const date_storage = new Storage('dates')
const instance_storage = new Storage('instances')
const conf_storage = new Storage('confs')
const tracks_storage = new Storage('tracks')

// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    date_storage.get_all('datevalue', (list) => {
        let cis = []
        instance_storage.get_all(null, (cilist) => {
            cilist.forEach((entry) => cis[entry.id] = entry)
            console.log('cis', cis)
            let confs = []
            conf_storage.get_all(null, (clist) => {
                clist.forEach((entry) => confs[entry.id] = entry)
                let tracks = []
                tracks_storage.get_all(null, (tlist) => {
                    tlist.forEach((entry) => tracks[entry.id] = entry)
                    list.forEach((entry) => {
                        console.log('elaborate on entry', entry)
                        if (entry.track_id) {
                            const t = tracks[entry.track_id]
                            Object.assign(entry, {
                                track: t,
                                instance_id: t.instance_id
                            })
                        }
                        if (entry.instance_id) {
                            const instance = cis[entry.instance_id]
                            Object.assign(entry, { instance })
                            const conf = confs[instance.conf_id]
                            Object.assign(entry, { conf })
                        }
                    })
                    console.log('dates', list)
                    res.render('dates', {title: 'Dates', dates: list })
                })
            })
        })
    })
})

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('dates.post with params', req.body)
    if (!req.body.empty) {
        let entry = {
            what: req.body.what,
            datevalue: Date.parse(req.body.datevalue)
        }
        if (req.body.instance_id) {
            entry = Object.assign(entry,
                { instance_id: req.body.instance_id })
            console.log('add', entry)
            date_storage.add(entry, (id) => {
                res.redirect('/instance/' + req.body.instance_id)
            })
        } else if (req.body.track_id) {
            entry = Object.assign(entry,
                { track_id: req.body.track_id })
            console.log('add', entry)
            date_storage.add(entry, (id) => {
                res.redirect('/track/' + req.body.track_id)
            })
        }
    }
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete date', req.params.id)
    date_storage.del(req.params.id, () => {
        if (req.body.instance_id) {
            res.redirect('/instance/' + req.body.instance_id)
        }
    })
})

module.exports = router
