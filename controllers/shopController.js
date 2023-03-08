const moment = require("moment");

const Shop = require("../models/ShopSchema");
const Slot = require("../models/SlotSchema");
const Order = require("../models/OrderSchema");
const Client = require("../models/ClientSchema");
const Product = require("../models/ProductSchema");

const mailController = require("./mailController");

async function getClosedShops(req, res) {
  try {
    let shops;
    if (req.query.zip !== undefined)
      shops = await Shop.find({ zip: req.query.zip });
    else shops = await Shop.find();// transformer les objets shops en un tableau contenant seulement le nom de chaque boutique
    if (shops.length == 0)
      res.status(204).json({ message: "No shops found" });
    else res.status(200).json({ shops });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

async function newShop(req, res) {
  if(req.body.name == undefined || req.body.codePostal == undefined)
    return res.status(400).json({ error: 'Missing parameters !' });
    

  
  try {
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
      sellerId: req.body.sellerId,
      zip: req.body.codePostal,
    });
    const savedShop = await shop.save();
    res.status(201).json(savedShop);
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ error: "Shop already exists !" });
    res.status(500).json({ message: error });
  }
}

async function getProducts(req, res) {
  if (req.params.shopId == undefined) {
    return res.status(400).json({ message: "Missing parameters" });
  }
  try {
    let shop;
    try {
      shop = await Shop.findById(req.params.shopId);
    } catch (error) {
      return res.status(404).json({ message: "Shop not found" });
    }
    const products = new Set();
    for (const entry of shop.products.entries()) {
      const value = entry[1];
      const product = await Product.findById(value.product);
      if (product == null) {
        return res.status(404).json({ message: "Product not found" });
      }
      products.add({
        id: product._id,
        name: product.name,
        price: product.price,
        quantity: value.quantity,
      });
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

async function getProduct(req, res) {
  if (req.params.productId == undefined || req.params.shopId == undefined) {
    return res.status(400).json({ message: "Missing parameters" });
  }
  try {
    let shop;
    try {
      shop = await Shop.findById(req.params.shopId);
    } catch (error) {
      return res.status(404).json({ message: "Shop not found" });
    }
    let productQuantity;

    for (const entry of shop.products.entries()) {
      const value = entry[1];
      if (value.product == req.params.productId) {
        const product = await Product.findById(value.product);
        if (product == null) {
          return res.status(404).json({ message: "Product not found" });
        }
        return  res.status(200).json({ product: product, quantity: value.quantity });
      }
    }
    if (productQuantity == null) {
      res.status(404).json({ message: "Product not found" });
    }
   
  } catch (error) {
    res.status(500).json({ message: error });
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

    try {
      const shop = await Shop.findById(req.params.shopId);
    } catch (error) {
      return res.status(404).json({ message: "Shop not found" });
    }
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
            orders.some((order) =>
                new Date(order.withdrawDate).getHours() == h &&
                new Date(order.withdrawDate).getMinutes() == m)
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
  if (req.body.year == undefined || req.body.month == undefined || req.body.day == undefined || req.body.hour == undefined || req.body.minute == undefined)
    return res.status(400).json({ message: "Bad request" });
  try {
    let order;
    let client;
    try {
      order = await Order.findById(req.params.orderId);    
    } catch (error) {
      return res.status(404).json({ message: "Order not found" });
    }
  
    try {
      client = await Client.findById(order.clientId);   
    } catch (error) {
      return res.status(404).json({ message: "Client not found" });
    }
    const isClientBookingHisOrder = order.clientId == client.id;
    if (!isClientBookingHisOrder)
      return res
        .status(403)
        .json({ message: "Client is not the owner of the order" });
     
      const date = new Date(
        req.body.year,
        req.body.month - 1,
        req.body.day,
        req.body.hour,
        req.body.minute
      );
      order.withdrawDate = date.getTime();
    
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

    if (shop == null) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const products = shop.products;

    if (products == null) {
      return res.status(404).json({ message: "No Products in shop" });
    }

    const productsToUpdate = req.body.products;

    for (let productName in productsToUpdate) {
      const product = await Product.findOne({
        name: productsToUpdate[productName].product.name,
      });
      if (product == null) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (productsToUpdate[productName].action == "add") {
        for (const entry of shop.products.entries()) {
          if (entry[1].product == product.id) {
            return res.status(400).json({ message: "Product already in shop" });
          }
        }
        countAddedProducts++;
        shop.products.set(productName, {
          product: product.id,
          quantity: productsToUpdate[productName].quantity,
        });
        await shop.save();
      } else {
        for (const entry of shop.products.entries()) {
          const key = entry[0];
          const value = entry[1];
          if (
            value.product == product.id &&
            productsToUpdate[productName].action == "update"
          ) {
            countUpdatedProducts++;
            if (productsToUpdate[productName].quantity < 0) {
              return res
                .status(400)
                .json({ message: "Quantity must be positive" });
            }
            if (productsToUpdate[productName].action == "update") {
              product.set({
                price: productsToUpdate[productName].product.price,
              });
              shop.products.set(key, {
                product: value.product,
                quantity: productsToUpdate[productName].quantity,
              });
              await product.save();
              await shop.save();
            }
          } else if (
            value.product == product.id &&
            productsToUpdate[productName].action == "delete"
          ) {
            countRemovedProducts++;
            shop.products.delete(key);
            await product.save();
            await shop.save();
          }
        }
      }
    }
    if (
      countAddedProducts == 0 &&
      countUpdatedProducts == 0 &&
      countRemovedProducts == 0
    ) {
      return res
        .status(204)
        .json({ message: "Nothing to update or delete in add" });
    }
    res
      .status(200)
      .json({
        message: `Stock updated successfully with ${countAddedProducts} added products, ${countUpdatedProducts} updated products and ${countRemovedProducts} removed products`,
      });
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
    res.status(200).json({ message: "Order validated", order: order });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

async function newOrder(req, res) {
  if(req.body.products === undefined || req.body.clientId === undefined) 
  return res.status(400).json({message: "Bad request"});
  try {
    const shop = await Shop.findById(req.params.shopId);
  } catch (error) {
    return res.status(404).json({ message: "Shop not found" });
  }
  
  const client = await Client.findById(req.body.clientId);
  if(client === null) return res.status(404).json({message: "Client not found"});
 
  try {
    const products = req.body.products
    console.log('products: ', products);
    for(let productId in products){
      
      const quantity = products[productId].quantity;
      const product = await Product.findById(products[productId].product);
      console.log('products[productId].product: ', products[productId].product);

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
  getProduct,
  getShopSlots,
  bookSlot,
  updateShopStock,
  validateOrder,
  newOrder,
};
