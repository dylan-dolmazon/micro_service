const express = require('express');

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

mongoose.connect(process.env.BD_ADDRESS, ()=>{
    console.log("DB Connected ");
});

//...
const app = express();
app.use(express.json());

app.use('/products',routesProducts);
app.use('/shops',routesShops);
app.use('/sellers',routesSellers);
app.use('/clients',routesClients);
app.use('/orders',routesOrders);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT} ...`));