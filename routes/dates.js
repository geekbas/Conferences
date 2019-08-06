const express = require('express');
const router = express.Router();
const path = require('path');

const Conf = require(path.join('..', 'modules', 'conf'))
const Instance = require(path.join('..', 'modules', 'instance'))
const Track = require(path.join('..', 'modules', 'track'))

const moment = require('moment')

// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    if (!req.user) return res.redirect('/')
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
                    let dates = [];
                    (cidates.concat(tdates)).forEach((cidate) => {
                        let c_path = '/conf/' + cidate.conf_id
                        let ci_path = c_path + '/instance/' + cidate.instance_id
                        dates.push(Object.assign(cidate, {
                            conf: confs.get(cidate.conf_id),
                            c_path,
                            ci_path
                        }))
                    })
                    res.render('dates', Object.assign(req.session.viewdata, {
                        user: req.user,
                        dates: dates.sort((a, b) => { return a.when >= b.when })
                    }))
                }
            )
        })
    })
})

module.exports = router
