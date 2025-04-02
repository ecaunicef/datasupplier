const express = require('express');
const router = express.Router();
const ctrl=require('../controller/mentalHealthChatlineController');
const auth=require('../middleware/auth');

router.get('/get-chatline',ctrl.getChatline);


// Mobile api
router.post('/get-chat-link', ctrl.getChatLinkByCountry)


module.exports = router;   