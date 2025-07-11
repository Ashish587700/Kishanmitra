const express = require('express');
const { createCrop, getAllCrops } = require('../controllers/cropController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/',authMiddleware, createCrop);
router.get('/',authMiddleware, getAllCrops);

module.exports = router;
