const express = require('express');

require('dotenv/config');
const mongoose = require('mongoose');

const routesProducts = require('./routes/product');
const routesShops = require('./routes/shop');
const routesSellers = require('./routes/seller');
const routesClients = require('./routes/client');
const routesAdmin = require('./routes/admin');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT} ...`));