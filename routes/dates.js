const express = require('express');
const router = express.Router();
const path = require('path');

const Conf = require(path.join('..', 'modules', 'conf'))
const Instance = require(path.join('..', 'modules', 'instance'))
const Track = require(path.join('..', 'modules', 'track'))
const helpers = require('./helpers')
const moment = require('moment')

// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    if (!req.user) {
        return res.render('dates', Object.assign(req.session.viewdata, {
            navsection: 'dates',
        }))
    }
    Conf.get_all({ followed_by: req.user.id }, (confs) => {
//        console.log('dates/get confs', confs)
        let conf_ids = []
        confs.forEach((value, key) => conf_ids.push(key))

        Instance.get_all(conf_ids,
            (instances, cidates) => {
//            console.log('got instance list', instances)
//            console.log('got dates', cidates)

            Track.get_all_for(
                instances.map(i => i.id),
                (tracks, tdates) => {
//                    console.log('got tdates', tdates)
                    const dates = helpers.add_paths(cidates.concat(tdates), (e) => {
                        return { conf: confs.get(e.conf_id) }
                    }).filter((e) => { return e.when >= moment().format('YYYY-MM-DD') })

                    res.render('dates', Object.assign(req.session.viewdata, {
                        navsection: 'dates',
                        user: req.user,
                        dates: helpers.string_sort(dates)
                    }))
                }
            )
        })
    })
})

module.exports = router
