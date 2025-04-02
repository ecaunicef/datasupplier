const ctrl = require('../controller/MoodTrackerController.js');
const express = require('express');

const router = express.Router();

router.post('/all', ctrl.getMoodTracker);
router.post('/get-all', ctrl.getAllMoodTracker);

module.exports = router;