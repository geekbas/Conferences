var express = require('express');
var router = express.Router();
const path = require('path');
const Instance = require(path.join('..', 'modules', 'instance'))
const Conf = require(path.join('..', 'modules', 'conf'))
const helpers = require('./helpers')

function get_sub_list(map, entry, field, f = null) {
    let value = entry[field]
    let sub_map = map.get(value)
    if (!sub_map) {
        sub_map = f ? f() : new Map()
        map.set(value, sub_map)
    }
    return sub_map
}

function compress_map(map) {
    if (!(map instanceof Map)) return map
//    console.log('compress_map', map)
    let new_map = new Map()
    map.forEach((value, key) => {
        new_map.set(key, compress_map(value))
    })
//    console.log('new map has size', new_map.size)
    if (new_map.size === 1) {
        var first_key = new_map.keys().next().value
//        console.log('single key is', first_key)
        if (first_key === '.')
            return new_map.get(first_key)
    }
    return new_map
}

router.get('/',
    (req, res, next) => {
        if (!req.user) { return res.redirect('/') }
        next()
    },
    (req, res) => {
        Instance.get_all_by_region(req.user.id, (instances) => {
//            console.log('got instances', instances)
            instances = helpers.add_paths(instances)
            let countries = new Map()
            instances.forEach((instance) => {
                let regions = get_sub_list(countries, instance, 'country')
                let nearby_cities = get_sub_list(regions, instance, 'region')
                let cities = get_sub_list(nearby_cities, instance, 'nearby_city')
                let city = get_sub_list(cities, instance, 'city', () => { return [] })
                city.push(instance)
//                console.log('city:', city)
            })
//            console.log('countries:', countries)
            countries = compress_map(countries)
//            console.log('compressed countries:', countries)
            res.render('region/by_region', {
                navsection: 'regions',
                user: req.user,
                countries,
            })
        })
    }
)

module.exports = router;
