const moment = require('moment');

const Shop = require('../models/ShopSchema');
const Slot = require('../models/SlotSchema');
const Order = require('../models/OrderSchema');
const Client = require('../models/ClientSchema');
const Product = require('../models/ProductSchema');

const mailController = require('./mailController');

async function getClosedShops(req, res) {
    try {
      const shops = await Shop.find({zip: req.query.zip}); 
      const shopNames = shops.map(shop => shop.name); // transformer les objets shops en un tableau contenant seulement le nom de chaque boutique
      res.status(200).json({shopNames: shopNames, zip: req.params.zip});
    } catch (error) {
      res.status(500).json({message: error});
    }
  }
  
async function newShop(req,res){

    const products = req.body.products;
    
    for(let productId in products){
        const quantity = products[productId].quantity;
        const product = await Product.findById(products[productId].product);

        if(product == null){
            return res.status(404).json({message: "Product not found"});
        }
        if(quantity < 0){
            return res.status(404).json({message: "Quantity must be positive"});
        }
        if(product.price < 0){
            return res.status(404).json({message: "Price must be positive"});
        }
    }

    const shop = new Shop({
        name: req.body.name,
        products: req.body.products,
        sellerId: req.body.seller,
        zip: req.body.codePostal
    });
    try{
        const savedShop = await shop.save();
        res.status(201).json(savedShop);
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function getProducts(req,res){
    try {
        const shop = await Shop.findById(req.params.shopId);
      
        const products = new Set();
        for (const entry of shop.products.entries()) {
            const value = entry[1];
            const product = await Product.findById(value.product);
            if (product == null) {
                return res.status(404).json({ message: "Product not found" });
            }
            products.add({ name: product.name, price: product.price });
        }
      
        const productsArray = Array.from(products);
        if (productsArray.length === 0) {
          return res.status(204).json({ message: "No products found" });
        }
      
        res.status(200).json(productsArray);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getProductQuantity(req,res){
    try{
        const shop = await Shop.findById(req.params.shopId);
        
        if(shop == null){
            return res.status(404).json({message: "Shop not found"});
        }

        let productQuantity;

        for (const entry of shop.products.entries()) {
            const value = entry[1];
            if(value.product == req.params.productId){
                const product = await Product.findById(value.product);
                if (product == null) {
                    return res.status(404).json({ message: "Product not found" });
                }
                productQuantity = {name: product.name, quantity: value.quantity};
            }
        }
        if(productQuantity == null){
            res.status(404).json({message: "Product not found"});
        }
        res.status(200).json({produit: productQuantity});
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
}

async function getShopSlots(req, res) {
    try {
        const slots = await Slot.find({shopId: req.params.shopId, isAvailable: true});
        const slotsData = slots.map(slot => ({
            id: slot.id,
            date: moment(slot.date).format('DD/MM/YYYY - HH-mm')
        }));
        if(slotsData.length == 0){
            res.status(204).json({message: "No slots found"});
        }
        res.status(200).json(slotsData);
    } catch (error) {
        res.status(500).json({message:error})
    }
}


async function bookSlot(req,res){
    try{
        const order = await Order.findById(req.body.orderId);
        const client = await Client.findById(req.body.clientId);

        if(order == null){
            return res.status(404).json({message: "Order not found"});
        }
        if(client == null){
            return res.status(404).json({message: "Client not found"});
        }

        const isClientBookingHisOrder = order.clientId == client.id;

        if(isClientBookingHisOrder){
            const slot = await Slot.findOne({id: req.params.slotId, isAvailable: true});
            if(slot){
                slot.isAvailable = false;
                slot.clientId = req.body.clientId;
                slot.orderId = req.body.orderId;
                const savedSlot = await slot.save();
                const slotBooked = {
                    id: savedSlot.id,
                    date: moment(savedSlot.date).format('DD/MM/YYYY - HH-mm'),
                    orderId: savedSlot.orderId,
                }
                return res.status(200).json(slotBooked);
            }else{
                return res.status(404).json({message: "Slot not found or slot already booked"});
            }
        }
        else
        {
            return res.status(404).json({message: "Client is not the owner of the order"});
        }
    }
    catch(error)
    {
        res.status(500).json({message: error})
    }
}

async function updateShopStock(req, res) {
    try {
        const shop = await Shop.findById(req.params.shopId);

        let countAddedProducts = 0;
        let countRemovedProducts = 0;
        let countUpdatedProducts = 0;

        if(shop == null){
            return res.status(404).json({message: "Shop not found"});
            }

        const products = shop.products;
            
        if(products == null){
            return res.status(404).json({message: "No Products in shop"});
        }
            
        const productsToUpdate = req.body.products;

        for (let productName in productsToUpdate) {
            const product = await Product.findOne({name: productsToUpdate[productName].product.name});
            if(product == null){
                return res.status(404).json({message: "Product not found"});
            }

            if(productsToUpdate[productName].action == "add"){
                countAddedProducts++;
                shop.products.set(productName,{
                    product: product.id,
                    quantity: productsToUpdate[productName].quantity
                });
                await shop.save();
            }else{
                for (const entry of shop.products.entries()) {
                    const key = entry[0];
                    const value = entry[1];
                    if(value.product == product.id && productsToUpdate[productName].action == "update"){
                        countUpdatedProducts++;
                        if(productsToUpdate[productName].quantity < 0){
                            return res.status(400).json({message: "Quantity must be positive"});
                        }
                        if(productsToUpdate[productName].action == "update"){
                        product.set(
                            {
                                price: productsToUpdate[productName].product.price,
                            }
                        );
                        shop.products.set(key, {
                            product: value.product,
                            quantity: productsToUpdate[productName].quantity
                        });
                        await product.save();
                        await shop.save();
    
                        }
                    }else if(value.product == product.id && productsToUpdate[productName].action == "delete"){
                        countRemovedProducts++;
                        shop.products.delete(key);
                        await product.save();
                        await shop.save();
                    }
                } 
            }
        }
    res.status(200).json({message: `Stock updated successfully with ${countAddedProducts} added products, ${countUpdatedProducts} updated products and ${countRemovedProducts} removed products`});
    } catch (error) {
    res.status(500).json({ message: error });
    }
}

async function validateOrder(req, res) {
    try {
        let order = await Order.findById(req.params.orderId)
        if (order === null){
            return res.status(404).json({ error: 'Order not found !' });
        }
        order.isValid = true;
        await order.save();

        const client = await Client.findById(order.clientId);
        if(client === null){
            return res.status(404).json({ error: 'Client not found !' });
        }

        mailController.sendConfirmation(client.email, order.id);
        res.status(200).json({ message: "Order validated", order: order.id});
    } catch (error) {
        res.status(500).json({message: error})
    }
}

async function newOrder(req, res) {
    try {
        const order = new Order({
            products: req.body.products,
            shopId: req.params.shopId,
            isValid: false,
            date: new Date(),
            clientId: req.body.clientId            
        });
        await order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
}

module.exports = {
    getClosedShops,
    newShop,
    getProducts,
    getProductQuantity,
    getShopSlots,
    bookSlot,
    updateShopStock,
    validateOrder,
    newOrder
}