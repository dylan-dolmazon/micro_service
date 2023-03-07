const express = require('express');
const security = require('./auth')

/*
const routesproducts = require('./routes/product');
const userRoutes = require('./routes/user');

const security = require('./auth');
*/

require('dotenv/config');
const mongoose = require('mongoose');

const routesProducts = require('./routes/product');
const routesShops = require('./routes/shop');
const routesSellers = require('./routes/seller');
const routesClients = require('./routes/client');
const routesOrders = require('./routes/order');
const routesAdmin = require('./routes/admin');

mongoose.connect("mongodb://localhost:27017/pimpoShop", ()=>{
    console.log("DB Connected ");
});

//...
const app = express();
app.use(express.json());

app.use('/products',routesProducts);
app.use('/shops', routesShops);
app.use('/sellers',routesSellers);
app.use('/clients',routesClients);
app.use('/orders',routesOrders);
app.use('/admin', routesAdmin);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT} ...`));