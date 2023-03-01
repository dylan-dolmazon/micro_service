const express = require('express');

const shopController = require('../controllers/shopController');

const router = express.Router();

router.get('/:codePostal', shopController.getClosedShops);
router.post('/', shopController.newShop);
router.get('/:shopId/products', shopController.getProducts);
router.get('/:shopId/products/:productId/quantity', shopController.getProductQuantity)

module.exports = router;