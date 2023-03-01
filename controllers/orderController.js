const Order = require('../models/OrderSchema');

async function newOrder(req, res) {
    try {
        const order = new Order({
            products: req.body.products,
            shopId: req.params.shopId,
            isValid: false,
            date: new Date(),
            clientId: req.params.clientId
        });
        console.log(order)
        await order.save();
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = {
    newOrder
}