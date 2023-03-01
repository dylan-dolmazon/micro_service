const express = require('express');

const sellerController = require('../controllers/sellerController');

const router = express.Router();

router.post('/', sellerController.newSeller);
router.post('/:sellerId/message', sellerController.newMessage);

module.exports = router;