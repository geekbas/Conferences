const express = require('express');
const router = express.Router();
///var fs = require("fs");
const path = require('path');

const Conf = require(path.join('..', 'modules', 'conf'))
const helpers = require('./helpers')

/* GET home page. */
router.get('/', function(req, res) {
  Conf.get_by_acronym('DEBS', (conf) => {
    res.render('about', {
      navsection: 'about',
      user: req.user,
      conf_debs: helpers.add_paths([ conf ])[0],
    })
  })
})

module.exports = router;
