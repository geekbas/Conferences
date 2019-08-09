const express = require('express');
const router = express.Router({mergeParams: true});
const path = require('path');

const Instance = require(path.join('..', 'modules', 'instance'))
const Track = require(path.join('..', 'modules', 'track'))
const User = require(path.join('..', 'modules', 'user'))
const Note = require(path.join('..', 'modules', 'note'))
const helpers = require('./helpers')

router.param('instance_id',
    (req, res, next, instance_id) => {
        Instance.get_by_id(instance_id, (ci, dates) => {
            console.log('loaded instance', ci, 'with dates', dates)
            req.session.instance = ci
            req.session.instance_dates = dates
            req.session.viewdata.instance = ci
            req.session.viewdata.ci_path = req.session.viewdata.c_path + '/instance/' + ci.id
            next()
        })
    }
)

router.use('/:instance_id/track', require('./tracks'));

function require_user(req, res, next, return_path) {
    console.log('require_user, user is', req.user)
    if (!req.user) {
        return res.redirect(return_path)
    }
    next()
}

function can_edit(req, res, next) {
    const ci = req.session.instance
    if (!User.can_edit(ci, req.user)) {
        return res.redirect('/')
    }
    console.log('can_edit', ci)
    next()
}

function can_delete(req, res, next) {
    const ci = req.session.instance
    if (!User.can_delete(ci, req.user)) {
        return res.redirect('/')
    }
    console.log('can_delete', ci)
    next()
}

function get_one(req, done) {
    console.log('instances/get_one, params =', req.params)
    const ci = req.session.instance
    Track.get_all(ci.id, (tracks, dates) => {
//        console.log('tracks', tracks)
//        console.log('dates', dates)
        done(
            Object.assign(req.session.viewdata, {
                instance: ci,
                tracks: tracks,
                dates: helpers.string_sort(dates.concat(req.session.instance_dates)),
                perms: {
                    can_edit: User.can_edit(ci, req.user),
                    can_delete: User.can_delete(ci, req.user)
                },
                user: req.user
            })
        )
    })
}

// noinspection JSUnresolvedFunction
router.get('/:instance_id', (req, res) => {
    get_one(req, (fields) => {
        Note.get(
            req.user ? req.user.id : null,
            'instance_id', req.session.instance.id,
            (notes) => {
                res.render('instance/show', Object.assign(fields, { notes }))
            }
        )
    })
})

// noinspection JSUnresolvedFunction
router.get('/:instance_id/edit',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        get_one(req, (fields) => {
            Note.get_mine(
                req.user.id,
                'instance_id',
                req.session.instance.id,
                (private_note, public_note) => {
                    console.log('private note:', private_note)
                    console.log('public note:', public_note)
                    res.render(
                        'instance/edit',
                        Object.assign(fields, {
                            private_note,
                            public_note,
                        })
                    )
                }
            )
        })
    }
)

// noinspection JSUnresolvedFunction
router.delete('/:instance_id',
    (req, res, next) => { can_delete(req, res, next) },
    (req, res) => {
        console.log('delete instance', req.params.instance_id)
        Instance.del(req.params.instance_id, () => {
            res.redirect(req.session.viewdata.c_path)
        })
    }
)

// noinspection JSUnresolvedFunction
router.post('/',
    (req, res, next) => { require_user(req, res, next, req.headers.referer) },
    (req, res) => {
        console.log('post with params', req.body)
        if (!req.body.empty) {
            const user_id = req.user.id
            const conf_id = req.params.conf_id
            Instance.add({
                conf_id: conf_id,
                year: req.body.year,
                added_by_user_id: user_id,
                private_for_user_id: user_id
            }, (id) => {
                res.redirect(req.session.viewdata.c_path + '/instance/' + id + '/edit');
            })
        }
    }
)

// noinspection JSUnresolvedFunction
router.put('/:instance_id',
    (req, res, next) => { can_edit(req, res, next) },
    (req, res) => {
        console.log('put with params', req.body)
        Instance.update(req.params.instance_id, req.body, (id) => {
            res.redirect(req.session.viewdata.c_path + '/instance/' + id);
        })
    }
)

router.put('/:instance_id/note',
    (req, res, next) => { require_user(req, res, next, req.headers.referer) },
    (req, res) => {
        console.log('post note with params', req.body)
        if (req.body.note_id) {
            if (req.body.note.trim().length > 0) {
                Note.update(req.body.note_id, req.body, (id) => {
                    res.redirect(req.session.viewdata.ci_path);
                })
            } else {
                Note.del(req.body.note_id, () => {
                    res.redirect(req.session.viewdata.ci_path);
                })
            }
        } else {
            Note.add(Object.assign(req.body, {
                user_id: req.user.id,
                instance_id: req.session.instance.id,
            }), (id) => {
                res.redirect(req.session.viewdata.ci_path);
            })
        }
    }
)

module.exports = router;
