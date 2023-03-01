const mongoose = require('mongoose');

const SellerSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    messages: {
        type: [String],
        required: false
    },
});

module.exports = mongoose.model('Seller', SellerSchema);