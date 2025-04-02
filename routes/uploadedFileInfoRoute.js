const ctrl = require('../controller/UploadedFileInfoController');
const express = require('express');

const router = express.Router();

router.get('/get-log-list', ctrl.getImportLog);


module.exports = router;