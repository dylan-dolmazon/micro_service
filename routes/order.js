const express = require('express');

const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/clients/:clientId/shops/:shopId', orderController.newOrder);

module.exports = router;