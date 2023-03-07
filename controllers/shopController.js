const moment = require('moment');

const Shop = require('../models/ShopSchema');
const Slot = require('../models/SlotSchema');
const Order = require('../models/OrderSchema');
const Client = require('../models/ClientSchema');

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
    try{
        const shop = await Shop.findById(req.params.shopId);
        const produits = Array.from(shop.products.values()).map(({ product }) => {
            const { name, price } = product;
            return { name, price };
          });        
        if(produits.length == 0){
            res.status(204).json({message: "No products found"});
        }
        res.status(200).json(produits);
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
        if(product == null){
            res.status(404).json({message: "Product not found"});
        }
        res.status(200).json({quantity: product.quantity, productName: product.product.name});
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
            res.status(404).json({message: "Order not found"});
        }
        if(client == null){
            res.status(404).json({message: "Client not found"});
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
                res.status(200).json(slotBooked);
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
        res.status(500).json({message: error})
    }
}

async function updateShopStock(req, res) {
    try {
      const shop = await Shop.findById(req.params.shopId);

      if(shop == null){
        res.status(404).json({message: "Shop not found"});
        }

      const products = shop.products;
  
      const productsToUpdate = req.body.products;

      for (let productName in productsToUpdate) {
        const name = productsToUpdate[productName].product.name;
        const price = productsToUpdate[productName].product.price;
        const quantity = productsToUpdate[productName].quantity;
        const action = productsToUpdate[productName].action;

        if(action == "add" || action == "modify"){
            products.set(name, {product:{ name: name, price: price}, quantity: quantity});
        }else if(action == "delete"){
            products.delete(name);
        }
      }
      await shop.save();
  
      res.status(200).json({ message: "Stock updated successfully" });
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