const express = require('express');
const ctrl = require('../controller/CredentialController.js');
const { route } = require('./index.js');
const router = express.Router();
const auth =require('../middleware/auth.js');


router.post('/get-credential',[auth],ctrl.getAllCredentials);
router.post('/check-token', ctrl.checkToken);
// router.get('/get-role-by-country',[auth],ctrl.getRoleByCountry);


module.exports =router;
