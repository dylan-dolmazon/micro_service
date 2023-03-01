const Shop = require('../models/ShopSchema');

async function getClosedShops(req,res){
    try{
        const shops = await Shop.find({zip: req.params.codePostal}); 
        console.log(shops);
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

module.exports = {
    getClosedShops,
    newShop,
    getProducts,
    getProductQuantity
}