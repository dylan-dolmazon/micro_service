const mongoose = require('mongoose');

const ProductSchema = require('./ProductSchema');

const OrderSchema = mongoose.Schema({
    products: {
        type: Map,
        of: {
          type: {
            product: {
              type: ProductSchema,
              required: true
            },
            quantity: {
              type: Number,
              required: true,
              min: 0
            }
          }
        }
    },
    shopId: {
        type: String,
        required: true
    },
    isValid: {
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    clientId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Order', OrderSchema);