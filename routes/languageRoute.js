const ctrl= require('../controller/LanguageController');
const express = require('express');

const router = express.Router();

// Admin Apis
router.get('/exportData/:dataType', ctrl.exportData);


module.exports = router;