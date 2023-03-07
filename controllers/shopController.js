const Shop = require('../models/ShopSchema');
const Slot = require('../models/SlotSchema');
const Order = require('../models/OrderSchema');
const Client = require('../models/ClientSchema');

async function getClosedShops(req,res){
    try{
        const shops = await Shop.find({zip: req.params.codePostal}); 
        
        res.status(200).json(shops);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function newShop(req,res){

    const shop = new Shop({
        name: req.body.name,
        products: req.body.products,
        sellerId: req.body.seller,
        zip: req.body.codePostal
    });
    try{
        const savedShop = await shop.save();
        res.status(200).json(savedShop);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function getProducts(req,res){
    try{
        const shop = await Shop.findById(req.params.shopId);
        const products = shop.products;
        res.status(200).json(products);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function getProductQuantity(req,res){
    try{
        const shop = await Shop.findById(req.params.shopId);
        const product = shop.products.get(req.params.productId);
        res.status(200).json({quantity: product.quantity, productName: product.product.name});
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function getShopSlots(req,res){
    try{
        const slots = await Slot.find({shopId: req.params.shopId, isAvailable: true});
        res.status(200).json(slots);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function bookSlot(req,res){
    try{
        const order = await Order.findById(req.body.orderId);
        const client = await Client.findById(req.body.clientId);

        const isClientBookingHisOrder = order.clientId == client.id;

        if(isClientBookingHisOrder){
            const slot = await Slot.findOne({id: req.params.slotId, isAvailable: true});
            if(slot){
                slot.isAvailable = false;
                slot.clientId = req.body.clientId;
                slot.orderId = req.body.orderId;
                const savedSlot = await slot.save();
                res.status(200).json(savedSlot);
            }else{
                res.status(404).json({message: "Slot not found or slot already booked"});
            }
        }
        else
        {
            res.status(404).json({message: "Client is not the owner of the order"});
        }
    }
    catch(error)
    {
        res.status(404).json({message: "Client or order not found"})
    }
}

module.exports = {
    getClosedShops,
    newShop,
    getProducts,
    getProductQuantity,
    getShopSlots,
    bookSlot
}