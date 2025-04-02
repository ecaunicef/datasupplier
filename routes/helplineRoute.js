const ctrl = require('../controller/HelplineController.js');
const express = require('express');

const auth = require("../middleware/auth");

const router = express.Router();

router.post('/all', ctrl.getHelpline);
router.post('/get-filtered-data', auth, ctrl.getFilterData);


// ==================================== mobile api ==============================

router.get('/all', ctrl.getHelplineForMobile)
router.post('/get-helpline-by-classification', ctrl.getHelplineByClassification)

module.exports = router;