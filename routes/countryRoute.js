const ctrl= require('../controller/CountryController');
const express = require('express');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.get('/get-country',auth, ctrl.getCountry);
router.get('/all', ctrl.getCountryAll);
router.get('/get-all-area', auth, ctrl.getAllArea);
router.get('/get-country-list',ctrl.getCountryList);

router.post('/get-location-data', ctrl.getLocationData)

module.exports = router;