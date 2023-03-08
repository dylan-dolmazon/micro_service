const mongoose = require('mongoose');

const ShopSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sellerId: {
        type: [String],
        required: false
    },
    zip: {
        type: String,
        required: true
    },
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
    }
});
module.exports = mongoose.model('Shop', ShopSchema);