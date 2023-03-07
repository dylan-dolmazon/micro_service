const express = require('express');

const shopController = require('../controllers/shopController');

const router = express.Router();

router.get('/zip/:codePostal', shopController.getClosedShops);
router.post('/', shopController.newShop);
router.get('/:shopId/products', shopController.getProducts);
router.get('/:shopId/products/:productId/quantity', shopController.getProductQuantity)
router.get('/:shopId/slots', shopController.getShopSlots);
router.put('/:shopId/slots/:slotId', shopController.bookSlot);

module.exports = router;