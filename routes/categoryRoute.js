const ctrl= require('../controller/CategoryController');
const express = require('express');

const router = express.Router();

router.post('/get-category', ctrl.getCategory);
router.get('/get-all-category', ctrl.getAllCategory);
router.get('/get-category-type',ctrl.getCategoryType);


// ============================= mobile apis ==================

router.get('/all', ctrl.getCategoryForMobile);


module.exports = router;