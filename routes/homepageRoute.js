const express = require('express');
const ctrl  = require('../controller/homepageController.js');

const router = express.Router();

router.post('/', ctrl.getCount);
router.post("/user-chart",ctrl.getUserChartData)
router.post("/counselling-chart",ctrl.getCounsellingChartData)


module.exports = router;