const express = require('express');
const router = express.Router();
const ctrl=require('../controller/AreaController');
const auth=require('../middleware/auth');

router.get('/get-area-list',ctrl.areaList);
router.get('/get-area-level',ctrl.areaLevel);
router.get('/get-getAreaHierarchy',ctrl.getAreaHierarchyList);
router.get('/list',[auth],ctrl.getAllAreaList);
router.get('/all', ctrl.getAllAreaData);
router.get('/exportData', ctrl.exportAreaTemplate);
router.post('/get-second-level-data', ctrl.getLevel2data);







module.exports = router;   