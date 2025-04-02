const ctrl= require('../controller/UserController.js');
const express = require('express');
const auth =require('../config/env.js');
const router = express.Router();



router.post('/get-user', ctrl.getUser);
router.post('/filter', ctrl.getFilterUser);
router.get('/generate-captcha', ctrl.generateCaptcha);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/details', ctrl.details);
router.post('/change-password',ctrl.changePassword);

module.exports = router;