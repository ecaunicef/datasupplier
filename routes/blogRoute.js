const express = require('express');
const { getAllBlogs, getBlogById, getAllBlogsForMobile, getBroadcastCategory, filterBroadcast} = require('../controller/blogController.js'); 

const router = express.Router();
const auth = require("../middleware/auth");

router.get('/get-all-blogs', auth, getAllBlogs);
router.post('/get-single-blog', getBlogById);
router.get('/get-broadcast-category', getBroadcastCategory)
router.post('/filter', auth, filterBroadcast)


//  ============================== mobile apis ==============================


router.post('/all', getAllBlogsForMobile)

module.exports = router;
