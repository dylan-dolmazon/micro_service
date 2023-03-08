const { number } = require('joi');
const mongoose = require('mongoose');

const ProductSchema = require('./ProductSchema');

const OrderSchema = mongoose.Schema({
    products: {
        type: Map,
        of: {
          type: {
            product: {
              type: String,
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
    },
    withdrawDate: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('Order', OrderSchema);