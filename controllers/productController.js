
const productObject = require('../models/ProductSchema')

async function newProduct(req,res){
    if(req.body.name == undefined || req.body.price == undefined)
        return res.status(400).json({error:"Missing parameters !"});
    try{
        const product = new productObject({
            name: req.body.name,
            price: req.body.price
        });
        await product.save();
        res.status(201).json(product);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function getAllProducts(req,res){
    try{
        const products = await productObject.find(); 
        if(products.length === 0)
            return res.status(204).json({error:"No result"});
        res.status(200).json(products);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
};

module.exports = {
    getAllProducts,
    newProduct
}
