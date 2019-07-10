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
    }
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete', req.params.id)
    follow_storage.del(req.params.id, () => {
        res.redirect('/conf/' + req.body.conf_id);
    })
})

module.exports = router
