const express = require('express');

const security = require('../auth')

const shopController = require('../controllers/shopController');

const router = express.Router();

router.get('/', shopController.getClosedShops);
router.get('/:shopId/products', shopController.getProducts);
router.get('/:shopId/products/:productId', shopController.getProductQuantity)

router.get('/:shopId/slots', security.checkAuth , shopController.getShopSlots);
router.put('/:shopId/slots/:slotId',security.checkAuth, shopController.bookSlot);

router.put('/:shopId/orders/:orderId',security.checkAdmin, shopController.validateOrder);
router.post('/:shopId/orders',security.checkAuth, shopController.newOrder);

router.post('/',security.checkAdmin, shopController.newShop);
router.put('/:shopId',security.checkAdmin, shopController.updateShopStock);

module.exports = router;