const express = require('express');
const router = express.Router();
const path = require('path');

const Storage = require(path.join('..', 'modules', 'storage'))
const conf_storage = new Storage('confs')
const instance_storage = new Storage('instances')

/* GET home page. */
// noinspection JSUnresolvedFunction
router.get('/', (req, res) => {
    conf_storage.get_all('name', (confs) => {
        res.render('index', {title: 'Conferences', confs })
    })
})

// noinspection JSUnresolvedFunction
router.get('/:id', (req, res) => {
    conf_storage.get_by_id(req.params.id,(c) => {
        console.log('show', c)
        instance_storage.get_all_by_key('conf_id', c.id, 'year', (list) => {
            res.render('conf/show', {title: 'Conference', conf: c, instances: list})
        })
    })
})

// noinspection JSUnresolvedFunction
router.get('/edit/:id', (req, res) => {
    conf_storage.get_by_id(req.params.id,(c) => {
        console.log('edit', c)
        res.render('conf/edit', {title: 'Conference', conf: c})
    })
})

// noinspection JSUnresolvedFunction
router.delete('/:id', (req, res) => {
    console.log('delete conf', req.params.id)
    conf_storage.del(req.params.id, () => {
        res.redirect('/conf');
    })
})

// noinspection JSUnresolvedFunction
router.post('/', (req, res) => {
    console.log('new conf with params', req.body)
    if (!req.body.empty) {
        conf_storage.add({ name: req.body.name },(id) => {
            res.redirect('/conf/edit/' + id)
        })
    }
})

// noinspection JSUnresolvedFunction
router.put('/', (req, res) => {
    const params = req.body
    console.log('put conf / with params', params)
    const updates = {
        name: params.name,
        acronym: params.acronym,
        url: params.url,
        format: params.format,
        acceptance_rate: params.acceptance_rate
    }
    conf_storage.update(req.body.id, updates,(id) => {
        res.redirect('/conf/' + id)
    })
})

module.exports = router
