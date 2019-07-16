const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const date_storage = new Storage('dates')
const instance_storage = new Storage('instances')
const conf_storage = new Storage('confs')
const tracks_storage = new Storage('tracks')
const Following = require(path.join('..', 'modules', 'follow'))
const moment = require('moment')

// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    let confs = []
    conf_storage.get_all(null, (clist) => {
        Following.select_followed(
            clist,
            req.session.show_all ? null : req.user,
            'conf_id',
            [],
            (clist2) => {
                clist2.forEach((entry) => confs[entry.id] = entry)

                let cis = []
                instance_storage.get_all(null, (cilist) => {
                    cilist.forEach((entry) => {
                        if (confs[entry.conf_id]) cis[entry.id] = entry
                    })
                    console.log('cis', cis)

                    let tracks = []
                    tracks_storage.get_all(null, (tlist) => {
                        tlist.forEach((entry) => {
                            if (cis[entry.instance_id]) tracks[entry.id] = entry
                        })

                        let datelist = []
                        const today = moment().format("YYYY-MM-DD")
                        date_storage.get_all('datevalue', (list) => {
                            list.forEach((entry) => {
//                                console.log('elaborate on entry', entry)
                                if (entry.datevalue >= today) {
                                    if (entry.track_id) {
                                        const t = tracks[entry.track_id]
                                        if (t) {
                                            Object.assign(entry, {
                                                track: t,
                                                instance_id: t.instance_id
                                            })
                                        }
                                    }
                                    if (entry.instance_id) {
                                        const instance = cis[entry.instance_id]
                                        if (instance) {
                                            Object.assign(entry, {instance})
                                            const conf = confs[instance.conf_id]
                                            Object.assign(entry, {conf})
                                            datelist.push(entry)
                                        }
                                    }
                                }
                            })
                            res.render('dates', {
                                title: 'Dates',
                                dates: datelist,
                                navdate: true,
                                show_all: !!req.session.show_all,
                                user: req.user
                            })
                    })
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
            datevalue: new Date(req.body.datevalue)
        }
        if (req.body.instance_id) {
            entry = Object.assign(entry,
                { instance_id: req.body.instance_id })
            console.log('add', entry)
            date_storage.add(entry, (id) => {
                res.redirect('/conf/' + req.body.conf_id + '/instance/' + req.body.instance_id)
            })
        } else if (req.body.track_id) {
            entry = Object.assign(entry,
                { track_id: req.body.track_id })
            console.log('add', entry)
            date_storage.add(entry, (id) => {
                res.redirect('/conf/' + req.body.conf_id + '/instance/' + req.body.instance_id + '/track/' + req.body.track_id)
            })
        }
    }
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete date', req.params.id)
    date_storage.del(req.params.id, () => {
        if (req.body.instance_id) {
            res.redirect('/conf/' + req.body.conf_id + '/instance/' + req.body.instance_id)
        }
    })
})

module.exports = router
