const moment = require("moment");

const Shop = require('../models/ShopSchema');
const Slot = require('../models/SlotSchema');
const Order = require('../models/OrderSchema');
const Client = require('../models/ClientSchema');
const Product = require('../models/ProductSchema');

const mailController = require("./mailController");

async function getClosedShops(req, res) {
  try {
    let shops;
    if(req.query.zip!==undefined)
       shops = await Shop.find({ zip: req.query.zip });
    else
       shops = await Shop.find();
    const shopNames = shops.map((shop) => shop.name); // transformer les objets shops en un tableau contenant seulement le nom de chaque boutique
    if(shopNames.length == 0)
      res.status(204).json({ message: "No shops found" });
    else
      res.status(200).json({ shopNames: shopNames });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

async function newShop(req, res) {
  const shop = new Shop({
    name: req.body.name,
    products: req.body.products,
    sellerId: req.body.seller,
    zip: req.body.codePostal,
  });
  try {
    const savedShop = await shop.save();
    res.status(201).json(savedShop);
  } catch (error) {
    res.status(500).json({ message: error });
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
    if (
      req.query.year == null ||
      req.query.month == null ||
      req.query.day == null
    )
      return res.status(400).json({ message: "Bad request" });
    const date = new Date(req.query.year, req.query.month - 1, req.query.day);
    const dateFin = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );
    const dateEnMillisecondes = date.getTime();
    const orders = await Order.find({
      withdrawDate: {
        $gte: dateEnMillisecondes,
        $lte: dateFin.getTime(),
      },
      shopId: req.params.shopId,
    });

    var tab = [];

    for (var h = 8; h < 17; h++) {
      for (var m = 0; m <= 45; m += 15) {
        if (h != 13) {
          var heure = ("0" + h).slice(-2) + "h" + ("0" + m).slice(-2);
          if (
            orders.some(
              (order) =>
                new Date(order.withdrawDate).getHours() == h &&
                new Date(order.withdrawDate).getMinutes() == m
            )
          )
            tab.push([heure, "busy"]);
          else tab.push([heure, "free"]);
        }
      }
    }
    res.status(200).json({ slots: tab });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

async function bookSlot(req, res) {
    try {
      const order = await Order.findById(req.params.orderId);
      const client = await Client.findById(req.body.clientId);
  
      if (order == null) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (client == null) {
        return res.status(404).json({ message: "Client not found" });
      }
  
      const isClientBookingHisOrder = order.clientId == client.id;
      if (!isClientBookingHisOrder)
        return res
          .status(403)
          .json({ message: "Client is not the owner of the order" });
      if(req.body.year!==undefined && req.body.month!==undefined && req.body.day!==undefined && req.body.hour!==undefined && req.body.minute!==undefined){
          const date = new Date(req.body.year, req.body.month - 1, req.body.day, req.body.hour, req.body.minute);
          order.withdrawDate = date.getTime();
      }else{
          return res.status(400).json({ message: "Bad request" });
      }
      try {
        const savedOrder = await order.save();
        res.status(200).json(savedOrder);
      } catch (error) {
        res.status(500).json({ message: error });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
async function updateShopStock(req, res) {
    try {
        const shop = await Shop.findById(req.params.shopId);

        let countAddedProducts = 0;
        let countRemovedProducts = 0;
        let countUpdatedProducts = 0;

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
    let order = await Order.findById(req.params.orderId);
    if (order === null) {
      return res.status(404).json({ error: "Order not found !" });
    }
    order.isValid = true;
    await order.save();

    const client = await Client.findById(order.clientId);
    if (client === null) {
      return res.status(404).json({ error: "Client not found !" });
    }

    mailController.sendConfirmation(client.email, order.id);
    res.status(200).json({ message: "Order validated", order: order.id });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

async function newOrder(req, res) {
  try {
    const order = new Order({
      products: req.body.products,
      shopId: req.params.shopId,
      isValid: false,
      date: new Date(),
      clientId: req.body.clientId,
      withdrawDate: undefined,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error });
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
  newOrder,
};
