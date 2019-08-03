const express = require('express');
const router = express.Router();
const path = require('path');

const Following = require(path.join('..', 'modules', 'follow'))

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('follow/post with params', req.body)
    if (req.body.empty) {
        return res.redirect('/')
    }
    if (req.body.conf_id) {
        const conf_id = req.body.conf_id
        Following.follow(
            req.user,
            conf_id,
            (id) => { res.redirect('/conf/' + conf_id) })
    }
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    Following.unfollow(req.params.id, () => {
        if (req.body.conf_id) {
            return res.redirect('/conf/' + req.body.conf_id)
        }
    })
})

router.post('/filter', (req, res) => {
    console.log('filter from', req.headers.referer, 'show_all =', req.body.show_all)
    req.session.show_all = !!req.body.show_all
    console.log('current session:', req.session)
    res.redirect(req.headers.referer)
})

module.exports = router
