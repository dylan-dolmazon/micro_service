const express = require('express');
require('dotenv').config();

require('dotenv/config');
const mongoose = require('mongoose');

const routesProducts = require('./routes/product');
const routesShops = require('./routes/shop');
const routesSellers = require('./routes/seller');
const routesClients = require('./routes/client');
const routesOrders = require('./routes/order');
const routesAdmin = require('./routes/admin');

mongoose.connect(process.env.DB_ADRESS, ()=>{
    console.log("DB Connected ");
});

//...
const app = express();
app.use(express.json());

app.use('/products',routesProducts);
app.use('/shops', routesShops);
app.use('/sellers',routesSellers);
app.use('/clients',routesClients);
app.use('/orders',security.checkAuth,routesOrders);
app.use('/admin', routesAdmin);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT} ...`));