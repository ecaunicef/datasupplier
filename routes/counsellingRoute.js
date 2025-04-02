const ctrl= require('../controller/CounsellingController');
const express = require('express');

const router = express.Router();

// Admin Apis
router.get('/get-counselling', ctrl.getCounselling);
router.post('/get-user-based-counselling', ctrl.getUserBasedCounselling);

// Mobile app Apis
router.get('/all', ctrl.getAllCounselling);


module.exports = router;