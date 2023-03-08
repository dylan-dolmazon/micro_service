const express = require('express');

const mongoose = require('mongoose');

const routesProducts = require('./routes/product');
const routesShops = require('./routes/shop');
const routesSellers = require('./routes/seller');
const routesClients = require('./routes/client');
const routesAdmin = require('./routes/admin');
const routesOrder = require('./routes/order');
require('dotenv/config');

mongoose.connect(process.env.DB_ADDRESS, ()=>{
    console.log("DB Connected ");
});

//...
const app = express();
app.use(express.json());

app.use('/products',routesProducts);
app.use('/shops', routesShops);
app.use('/sellers',routesSellers);
app.use('/clients',routesClients);
app.use('/admin', routesAdmin);
app.use('/orders', routesOrder);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT} ...`));