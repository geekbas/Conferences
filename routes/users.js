var express = require('express');
var router = express.Router();
const path = require('path');
const Conf = require(path.join('..', 'modules', 'conf'))
//const User = require(path.join('..', 'modules', 'user'))
const Submission = require(path.join('..', 'modules', 'submission'))
const Track = require(path.join('..', 'modules', 'track'))

function add_paths(entries) {
    const a = []
    entries.forEach((entry) => {
        const c_path = '/conf/' + entry.conf_id
        const ci_path = c_path + '/instance/' + entry.instance_id
        const track_path = ci_path + '/track/' + entry.track_id
        let new_obj = Object.assign(entry, {c_path, ci_path, track_path})
        if (entry.submission_id)
            new_obj.submission_path = track_path + '/submission/' + entry.submission_id
        a.push(new_obj)
    })
    return a
}

router.get('/',
    (req, res, next) => {
        if (!req.user) { return res.redirect('/') }
        next()
    },
    (req, res) => {
        Conf.get_all({ followed_by: req.user.id, as_array: true }, (confs) => {
            Submission.get_all_mine(req.user.id, (submissions) => {
                const papers = add_paths(submissions)
                Track.find_upcoming(req.user.id, (tracks) => {
                    const upcoming = add_paths(tracks)
                    res.render('profile', {
                        user: req.user,
                        confs,
                        submissions: papers,
                        upcoming,
                    })
                })
            })
        })
    }
)

module.exports = router;
