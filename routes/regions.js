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
            res.render('by_region', {
                user: req.user,
                countries,
            })
        })
    }
)

module.exports = router;
