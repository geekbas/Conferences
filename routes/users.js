var express = require('express');
var router = express.Router();
const path = require('path');
const Conf = require(path.join('..', 'modules', 'conf'))
//const User = require(path.join('..', 'modules', 'user'))
const Submission = require(path.join('..', 'modules', 'submission'))

router.get('/',
    (req, res, next) => {
        if (!req.user) { return res.redirect('/') }
        next()
    },
    (req, res) => {
        Conf.get_all({ followed_by: req.user.id, as_array: true }, (confs) => {
            Submission.get_all_mine(req.user.id, (submissions) => {
                const papers = []
                submissions.forEach((entry) => {
                    const c_path = '/conf/' + entry.conf_id
                    const ci_path = c_path + '/instance/' + entry.instance_id
                    const track_path = ci_path + '/track/' + entry.track_id
                    const submission_path = track_path + '/submission/' + entry.id
                    papers.push(Object.assign(entry, { c_path, ci_path, track_path, submission_path }))
                })
                res.render('profile', {
                    user: req.user,
                    confs,
                    submissions: papers,
                })
            })
        })
    }
)

module.exports = router;
