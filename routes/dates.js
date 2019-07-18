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
    conf_storage.get_all(null, (clist) => {
//        console.log('conf get_all returned', clist)
        Following.select_followed(
            clist,
            req.session.show_all ? null : req.user,
            'conf_id',
            new Map(),
            (confs) => {
//                console.log('select followed returned', confs)
                instance_storage.get_all_by_key(
                    [],
                    {
                        post_filter: (obj) => { return !!confs.get(obj.conf_id) }
                    },
                    (cis) => {
//                        console.log('filtered instance list is', cis)
                        tracks_storage.get_all_by_key(
                            [],
                            {
                                post_filter: (obj => { return !!cis.get(obj.instance_id)})
                            },
                            (tracks) => {
//                                console.log('filtered track list is', tracks)
                                const not_before = moment().subtract(1, 'month').format("YYYY-MM-DD")
                                date_storage.get_all('datevalue', (list) => {
//                                    console.log('full date list is', list)
                                    let datelist = []
                                    list.forEach((entry) => {
//                                        console.log('examine date entry', entry)
                                        if (entry.datevalue >= not_before) {
                                            if (entry.track_id) {
                                                const t = tracks.get(entry.track_id)
                                                if (t) {
                                                    Object.assign(entry, {
                                                        track: Object.assign(t, { id: entry.track_id }),
                                                        instance_id: t.instance_id
                                                    })
                                                }
                                            }
                                            if (entry.instance_id) {
                                                const instance = cis.get(entry.instance_id)
                                                if (instance) {
                                                    Object.assign(entry, { instance })
                                                    const conf = confs.get(instance.conf_id)
                                                    const c_path = '/conf/' + instance.conf_id
                                                    const ci_path = c_path + '/instance/' + entry.instance_id
                                                    Object.assign(entry,
                                                        {
                                                            conf,
                                                            c_path,
                                                            instance,
                                                            ci_path
                                                        })
//                                                    console.log('datelist push', entry)
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
                    }
                )
            }
        )
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
