const express = require('express');

const shopController = require('../controllers/shopController');

const router = express.Router();

router.put('/:orderId', shopController.validateOrder);

module.exports = router;