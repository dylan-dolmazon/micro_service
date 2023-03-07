const Seller = require('../models/SellerSchema');

async function newSeller(req, res) {
    try {
        const seller = new Seller({
            firstname: req.body.firstname,
            email: req.body.email,
            phone: req.body.phone
        });
        await seller.save();
        res.status(201).json(seller);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

async function newMessage(req, res) {
    try {
        const seller = await Seller.findById(req.params.sellerId);
        seller.messages.push(req.body.message);
        await seller.save();
        res.status(201).json({seller: seller, message: 'Message create => '+ req.body.message});
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = {
    newSeller,
    newMessage
}