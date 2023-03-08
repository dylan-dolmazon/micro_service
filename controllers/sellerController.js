const Seller = require('../models/SellerSchema');

async function newSeller(req, res) {
    if(req.body.firstname == undefined || req.body.email == undefined || req.body.phone == undefined)
        return res.status(400).json({ error: 'Missing parameters !' });
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
        if(error.code === 11000)
            return res.status(409).json({ error: 'Email already exists !' });
        res.status(500).json({ message: error })
    }
}

async function newMessage(req, res) {
    if(req.body.message == undefined)
      return res.status(400).json({ error: 'Missing parameters !' });
      
    try {
        let seller;
        try{
            seller = await Seller.findById(req.params.sellerId);
        }catch{
            return res.status(404).json({ error: 'Seller not found !' });
        }
       
        seller.messages.push(req.body.message);
        await seller.save();
        res.status(201).json({seller: seller, message: 'Message create => '+ req.body.message});
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

async function getAllSellers(req, res) {
    try {
        const sellers = await Seller.find();
        if(sellers.length === 0)
            return res.status(204).json({ error: 'No result' });
        res.status(200).json(sellers);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
};

module.exports = {
    newSeller,
    newMessage,
    getAllSellers
}