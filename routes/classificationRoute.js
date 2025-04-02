const express = require('express');
const { getAllClassification, getClassificationType, getClassifications, getListByType } = require('../controller/ClassificationController.js');

const router = express.Router();
router.post('/all', getAllClassification);
router.get('/get-classification-type', getClassificationType);
router.get('/get-classifications', getClassifications)


// Mobile app api's
router.post('/get-list-by-type', getListByType);

module.exports = router;
