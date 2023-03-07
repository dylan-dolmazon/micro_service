
const productObject = require('../models/ProductSchema')

async function getAllProducts(req,res){
    try{
        const products = await productObject.find(); 
      	//FindById, FindOne(x => x.name == 'name'), ...
        res.status(200).json(products);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
};

module.exports = {
    getAllProducts
}
