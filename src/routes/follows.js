const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const follow_storage = new Storage('follows')

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('follow/post with params', req.body)
    if (req.body.empty) {
        return res.redirect('/')
    }
    if (req.body.conf_id) {
        const conf_id = req.body.conf_id
        if (req.user) {
            follow_storage.add({
                conf_id: conf_id,
                user_id: req.user.id
            },(id) => {
                res.redirect('/conf/' + conf_id)
            })
        } else {
            res.redirect('/conf/' + conf_id)
        }
        return
    }
    if (req.body.instance_id) {
        const instance_id = req.body.instance_id
        if (req.user) {
            follow_storage.add({
                instance_id: instance_id,
                user_id: req.user.id
            },(id) => {
                res.redirect('/instance/' + instance_id)
            })
        } else {
            res.redirect('/instance/' + instance_id)
        }
        return
    }
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete', req.params.id)
    follow_storage.del(req.params.id, () => {
        if (req.body.conf_id) {
            return res.redirect('/conf/' + req.body.conf_id)
        }
        if (req.body.instance_id) {
            return res.redirect('/instance/' + req.body.instance_id)
        }
    })
})

module.exports = router
